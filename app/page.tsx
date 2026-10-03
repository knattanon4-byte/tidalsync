import { redirect } from "next/navigation";

export default function RootPage() {
  // หน้าประตูหลัก: มีหน้าที่เตะคนเข้าหน้าภาษาไทย (/th) อัตโนมัติ
  redirect("/th");
}