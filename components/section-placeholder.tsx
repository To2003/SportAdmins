import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

export function SectionPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 border-dashed py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <Icon className="size-7" />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      </div>
      <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Próximamente
      </span>
    </Card>
  )
}
