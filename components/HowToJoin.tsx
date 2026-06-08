import { ShoppingBag, Upload, ShieldCheck, Trophy } from "lucide-react";
import ParticipationRules from "./ParticipationRules";

const steps = [
  {
    icon: ShoppingBag,
    title: "YE YE кофе худалдан авах",
    description: "Дэлгүүрээс YE YE 3 in 1 Instant Coffee Mix худалдан аваарай",
  },
  {
    icon: Upload,
    title: "Баримтаа бүртгүүлэх",
    description: "Худалдан авалтын баримтаа вэбсайтаар бүртгүүлээрэй",
  },
  {
    icon: ShieldCheck,
    title: "Админ баталгаажуулна",
    description: "Манай баг таны баримтыг шалгаж баталгаажуулна",
  },
  {
    icon: Trophy,
    title: "Азын сугалаанд оролцоно",
    description: "Баталгаажсан баримтын дагуу сугалааны эрх тооцогдоно",
  },
];

export default function HowToJoin() {
  return (
    <section id="how-to-join" className="py-20 lg:py-28 relative section-tint">
      <div className="absolute inset-0 bg-wine-red/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-light">
            ХЭРХЭН ОРОЛЦОХ ВЭ?
          </h2>
          <div className="w-24 h-1 bg-gold-gradient mx-auto mt-4 rounded-full" />
        </div>

        <ParticipationRules className="mb-16" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group bg-card-gradient rounded-2xl border border-gold/30 p-6 shadow-card hover:shadow-gold transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
                  <step.icon className="w-6 h-6 text-gold" />
                </div>
                <span className="text-gold/60 font-display text-2xl font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-cream font-semibold text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-cream/50 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
