import AdminWinnersTable from "@/components/AdminWinnersTable";

export default function AdminWinnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gold-light font-bold">
          Ялагчид
        </h1>
        <p className="text-cream/50 text-sm mt-1">
          Азын сугалааны ялагчдын жагсаалт
        </p>
      </div>
      <AdminWinnersTable />
    </div>
  );
}
