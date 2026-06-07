import AdminUsersTable from "@/components/AdminUsersTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gold-light font-bold">
          Хэрэглэгчид
        </h1>
        <p className="text-cream/50 text-sm mt-1">
          Бүртгэлтэй хэрэглэгчдийн жагсаалт
        </p>
      </div>
      <AdminUsersTable />
    </div>
  );
}
