import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, XCircle, CircleDashed } from "lucide-react"

type Tone = "success" | "warning" | "danger" | "neutral"

const toneStyles: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  danger: "bg-danger/12 text-danger border-danger/25",
  neutral: "bg-muted text-muted-foreground border-border",
}

export function StatusBadge({
  tone,
  children,
  icon,
  className,
}: {
  tone: Tone
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneStyles[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

export function PagoBadge({ estado }: { estado: "pendiente" | "en_revision" | "aprobado" | "rechazado" }) {
  if (estado === "aprobado")
    return (
      <StatusBadge tone="success" icon={<CheckCircle2 className="size-3.5" />}>
        Aprobado
      </StatusBadge>
    )
  if (estado === "en_revision")
    return (
      <StatusBadge tone="warning" icon={<Clock className="size-3.5" />}>
        En revisión
      </StatusBadge>
    )
  if (estado === "pendiente")
    return (
      <StatusBadge tone="neutral" icon={<CircleDashed className="size-3.5" />}>
        Pendiente
      </StatusBadge>
    )
  return (
    <StatusBadge tone="danger" icon={<XCircle className="size-3.5" />}>
      Rechazado
    </StatusBadge>
  )
}

export function SaldoBadge({ saldo }: { saldo: number }) {
  if (saldo < 0)
    return (
      <StatusBadge tone="danger" icon={<XCircle className="size-3.5" />}>
        Deudor
      </StatusBadge>
    )
  if (saldo > 0)
    return (
      <StatusBadge tone="success" icon={<CheckCircle2 className="size-3.5" />}>
        A favor
      </StatusBadge>
    )
  return <StatusBadge tone="neutral">Al día</StatusBadge>
}
