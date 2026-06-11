import AdminEntriesTable from "@/components/AdminEntriesTable";

export default function AdminEntriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gold-light font-bold">
          Эрх
        </h1>
        <p className="text-cream/50 text-sm mt-1">
          Баримтаар сугалааны эрх олгох, үлдэгдэл харах
        </p>
      </div>
      <AdminEntriesTable />
    </div>
  );
}
