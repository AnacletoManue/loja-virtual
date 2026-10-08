import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr] md:items-start">
      {/* A navegação fica fixa ao fazer scroll no desktop */}
      <div className="md:sticky md:top-6">
        <AdminNav email={session.email} />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}