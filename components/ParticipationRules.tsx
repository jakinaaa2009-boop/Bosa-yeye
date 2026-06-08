import { PARTICIPATION_RULES } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface ParticipationRulesProps {
  variant?: "default" | "compact" | "note";
  className?: string;
  showHelper?: boolean;
}

export default function ParticipationRules({
  variant = "default",
  className,
  showHelper = true,
}: ParticipationRulesProps) {
  if (variant === "note") {
    return (
      <div
        className={cn(
          "rounded-xl border border-gold/25 bg-coffee-dark/40 p-4 space-y-2 text-sm",
          className
        )}
      >
        <p className="text-gold font-semibold">Сугалааны эрх тооцох дүрэм:</p>
        <p className="text-cream/80">
          {PARTICIPATION_RULES.sachetProduct} = {PARTICIPATION_RULES.sachetEntries}
        </p>
        <p className="text-cream/80">
          {PARTICIPATION_RULES.bagProduct} = {PARTICIPATION_RULES.bagEntries}
        </p>
        <p className="text-cream/55 text-xs pt-1 leading-relaxed">
          {PARTICIPATION_RULES.uploadNote}
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-1 text-cream/55 text-xs leading-relaxed", className)}>
        <p className="text-gold/90 font-medium text-sm">
          {PARTICIPATION_RULES.title}
        </p>
        <p>
          {PARTICIPATION_RULES.sachetProduct} = {PARTICIPATION_RULES.sachetEntries}
        </p>
        <p>
          {PARTICIPATION_RULES.bagProduct} = {PARTICIPATION_RULES.bagEntries}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-display text-xl sm:text-2xl text-gold-light font-bold text-center">
        {PARTICIPATION_RULES.title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="bg-card-gradient rounded-2xl border border-gold/30 p-5 text-center shadow-card">
          <p className="text-cream font-semibold">{PARTICIPATION_RULES.sachetProduct}</p>
          <p className="text-gold text-2xl font-bold my-2">=</p>
          <p className="text-gold-light font-bold">{PARTICIPATION_RULES.sachetEntries}</p>
        </div>
        <div className="bg-card-gradient rounded-2xl border border-gold/30 p-5 text-center shadow-card">
          <p className="text-cream font-semibold">{PARTICIPATION_RULES.bagProduct}</p>
          <p className="text-gold text-2xl font-bold my-2">=</p>
          <p className="text-gold-light font-bold">{PARTICIPATION_RULES.bagEntries}</p>
        </div>
      </div>
      {showHelper && (
        <p className="text-cream/60 text-sm text-center max-w-xl mx-auto leading-relaxed">
          {PARTICIPATION_RULES.helper}
        </p>
      )}
    </div>
  );
}
