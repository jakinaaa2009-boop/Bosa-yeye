import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Хүлээгдэж байна",
    className: "bg-warning/20 text-warning border-warning/40",
  },
  approved: {
    label: "Баталгаажсан",
    className: "bg-success/20 text-success border-success/40",
  },
  rejected: {
    label: "Татгалзсан",
    className: "bg-danger/20 text-danger border-danger/40",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
