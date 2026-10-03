import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 🌟 ดึงข้อมูล Session ปัจจุบัน (ต้องใช้ getUser เพื่อความชัวร์ที่สุด)
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // เช็คว่าพยายามเข้าหน้า Dashboard อยู่หรือเปล่า
  const isDashboardPath = path.includes('/dashboard')

  // ถ้ายามตรวจพบว่า "ไม่มีสิทธิ์ (ไม่มี user)" และกำลังจะไปหน้า "dashboard"
  if (isDashboardPath && !user) {
    // เตะกลับไปหน้า Login
    url.pathname = '/th/login' // ค่าเริ่มต้นเป็น /th
    if (path.startsWith('/en/')) {
        url.pathname = '/en/login'
    }
    return NextResponse.redirect(url)
  }

  // ถ้าเข้ามาที่หน้า Login แต่ล็อกอินแล้ว (มี user)
  if (path.includes('/login') && user) {
      // ให้ข้ามไปหน้า Dashboard เลย
      url.pathname = '/th/dashboard'
      if (path.startsWith('/en/')) {
        url.pathname = '/en/dashboard'
      }
      return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}