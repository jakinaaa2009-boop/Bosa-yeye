import { cn } from "@/lib/utils";
import { SUPER_PRIZE } from "@/lib/site-content";

interface CarModelTextProps {
  className?: string;
}

export default function CarModelText({ className }: CarModelTextProps) {
  return (
    <span className={cn("car-model-text", className)}>{SUPER_PRIZE.model}</span>
  );
}
