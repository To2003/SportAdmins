import { ThemeToggle } from "@/components/theme-toggle"

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? <p className="text-sm text-muted-foreground text-pretty">{description}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
