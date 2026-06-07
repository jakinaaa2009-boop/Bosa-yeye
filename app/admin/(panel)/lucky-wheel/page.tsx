import LuckyWheel from "@/components/LuckyWheel";

export default function AdminLuckyWheelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gold-light font-bold">
          Азын сугалаа
        </h1>
        <p className="text-cream/50 text-sm mt-1">
          Баталгаажсан баримтуудаас санамсаргүй ялагч сонгох
        </p>
      </div>
      <LuckyWheel />
    </div>
  );
}
