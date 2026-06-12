import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      <Header />
      <Sidebar />
      <div className="md:pl-[200px] pt-0">
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
