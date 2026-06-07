import AdminReceiptsTable from "@/components/AdminReceiptsTable";

export default function AdminReceiptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gold-light font-bold">
          Баримтууд
        </h1>
        <p className="text-cream/50 text-sm mt-1">
          Бүх хэрэглэгчийн баримтын жагсаалт
        </p>
      </div>
      <AdminReceiptsTable />
    </div>
  );
}
