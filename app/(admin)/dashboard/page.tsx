"use client"

import Link from "next/link"
import { Receipt, AlertTriangle, Wallet, Lock, ArrowRight, CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SaldoBadge } from "@/components/status-badge"
import { equipos, partidos, formatARS, formatFecha, TORNEO } from "@/lib/data"
import { useDeudas } from "@/lib/deudas-store"

export default function DashboardPage() {
  const { deudas } = useDeudas()
  const pendientes = deudas.filter((d) => d.estado === "en_revision").length
  const deudores = equipos.filter((e) => e.saldo < 0)
  const deudaTotal = deudores.reduce((acc, e) => acc + e.saldo, 0)
  const bloqueados = equipos.filter((e) => e.bloqueado).length
  const topDeudores = [...deudores].sort((a, b) => a.saldo - b.saldo).slice(0, 5)
  const proximos = partidos
    .filter((p) => p.setsA === null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 4)

  const stats = [
    { label: "Comprobantes pendientes", value: pendientes, icon: Receipt, href: "/pagos", tone: "text-warning-foreground" },
    { label: "Equipos deudores", value: deudores.length, icon: AlertTriangle, href: "/pagos", tone: "text-danger" },
    { label: "Deuda total", value: formatARS(deudaTotal), icon: Wallet, href: "/pagos", tone: "text-danger" },
    { label: "Equipos bloqueados", value: bloqueados, icon: Lock, href: "/equipos", tone: "text-foreground" },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${TORNEO.nombre} · ${TORNEO.temporada} — Jornada ${TORNEO.jornadaActual}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <Card className="h-full transition-shadow hover:ring-primary/30">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                      <Icon className="size-4.5" />
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className={`font-display text-2xl font-bold ${s.tone}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground text-pretty">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-danger" />
              Principales morosos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {topDeudores.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{e.nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.capitan}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-danger">{formatARS(e.saldo)}</span>
                  <SaldoBadge saldo={e.saldo} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Próxima jornada
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {proximos.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.equipoA} <span className="text-muted-foreground">vs</span> {p.equipoB}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{p.cancha}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{p.hora}</p>
                  <p className="text-xs text-muted-foreground">{formatFecha(p.fecha)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
