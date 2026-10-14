"use client"

import Link from "next/link"
import {
  Receipt,
  AlertTriangle,
  Wallet,
  Lock,
  ArrowRight,
  CalendarDays,
  Trophy,
  Ban,
  BellRing,
  ListChecks,
  ClipboardEdit,
  CheckCircle2,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SaldoBadge } from "@/components/status-badge"
import { FORMATOS, formatARS, formatFecha } from "@/lib/data"
import { useDeudas } from "@/lib/deudas-store"
import { calcularPosiciones, fechasCumplidas, sancionVigente, useTorneo } from "@/lib/torneo-store"

export default function DashboardPage() {
  const { deudas } = useDeudas()
  const { equipos, partidos, jugadores, sanciones, jornadas, jornadaActual, config } = useTorneo()

  const pendientes = deudas.filter((d) => d.estado === "en_revision").length
  const deudores = equipos.filter((e) => e.saldo < 0)
  const deudaTotal = deudores.reduce((acc, e) => acc + e.saldo, 0)
  const bloqueados = equipos.filter((e) => e.bloqueado)
  const recaudado = deudas.filter((d) => d.estado === "aprobado").reduce((a, d) => a + d.monto, 0)
  const topDeudores = [...deudores].sort((a, b) => a.saldo - b.saldo).slice(0, 5)
  const proximos = partidos
    .filter((p) => p.setsA === null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    .slice(0, 4)
  const jugados = partidos.filter((p) => p.setsA !== null).length
  const lider = calcularPosiciones(equipos, partidos, config)[0]

  const vigentes = sanciones.filter((s) => sancionVigente(s, jornadaActual))
  const nombreEquipo = (id: string) => equipos.find((e) => e.id === id)?.nombre ?? "—"
  const jugador = (id?: string) => jugadores.find((j) => j.id === id)

  // Partidos de jornadas ya pasadas que siguen sin resultado
  const sinResultado = partidos.filter(
    (p) => p.setsA === null && (jornadas.find((j) => j.numero === p.jornada)?.estado === "jugada" || p.jornada < jornadaActual),
  ).length
  const rostersPendientes = equipos.filter((e) => e.roster === "pendiente").length
  const rostersSinEnviar = equipos.filter((e) => e.roster === "sin-enviar").length

  const alertas = [
    { show: pendientes > 0, icon: Receipt, text: `${pendientes} comprobantes esperan validación`, href: "/pagos", tone: "text-warning-foreground" },
    { show: rostersPendientes > 0, icon: ListChecks, text: `${rostersPendientes} listas de buena fe para aprobar`, href: "/equipos", tone: "text-warning-foreground" },
    { show: rostersSinEnviar > 0, icon: ListChecks, text: `${rostersSinEnviar} equipos no enviaron su lista`, href: "/equipos", tone: "text-danger" },
    { show: bloqueados.length > 0, icon: Lock, text: `${bloqueados.length} equipos bloqueados por deuda`, href: "/pagos", tone: "text-danger" },
    { show: sinResultado > 0, icon: ClipboardEdit, text: `${sinResultado} partidos jugados sin resultado cargado`, href: "/fixture", tone: "text-warning-foreground" },
    {
      show: vigentes.some((s) => s.tipo === "suspension"),
      icon: Ban,
      text: `${vigentes.filter((s) => s.tipo === "suspension").length} jugadores suspendidos para la jornada ${jornadaActual}`,
      href: "/sanciones",
      tone: "text-danger",
    },
  ].filter((a) => a.show)

  const stats = [
    { label: "Comprobantes pendientes", value: pendientes, icon: Receipt, href: "/pagos", tone: "text-warning-foreground" },
    { label: "Equipos deudores", value: deudores.length, icon: AlertTriangle, href: "/pagos", tone: "text-danger" },
    { label: "Deuda total", value: formatARS(deudaTotal), icon: Wallet, href: "/pagos", tone: "text-danger" },
    { label: "Equipos bloqueados", value: bloqueados.length, icon: Lock, href: "/pagos", tone: "text-foreground" },
  ]

  return (
    <>
      <PageHeader title="Dashboard" description={`${config.nombre} · ${config.temporada} — Jornada ${jornadaActual}`} />

      {/* 1.4.5.1 Resumen del torneo */}
      <Card className="mb-4">
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Formato</p>
            <p className="text-sm font-semibold text-foreground">{FORMATOS[config.formato]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avance</p>
            <p className="text-sm font-semibold text-foreground">
              Jornada {jornadaActual} de {config.cantidadJornadas}
            </p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, ((jornadaActual - 1) / config.cantidadJornadas) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Equipos / partidos jugados</p>
            <p className="text-sm font-semibold text-foreground">
              {equipos.length} equipos · {jugados} partidos
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recaudado</p>
            <p className="text-sm font-semibold text-success">{formatARS(recaudado)}</p>
          </div>
          {lider && lider.pj > 0 && (
            <Link
              href="/fixture"
              className="col-span-2 flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm sm:col-span-4"
            >
              <Trophy className="size-4 text-primary" />
              <span className="text-muted-foreground">Líder:</span>
              <span className="font-semibold text-foreground">{lider.equipo.nombre}</span>
              <span className="text-muted-foreground">· {lider.pts} pts</span>
              <ArrowRight className="ml-auto size-4 text-muted-foreground" />
            </Link>
          )}
        </CardContent>
      </Card>

      {/* 1.4.5.2 Estado de pagos */}
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
        {/* 1.4.5.5 Alertas y pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="size-4 text-primary" />
              Alertas y pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {alertas.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" />
                Todo al día.
              </p>
            ) : (
              alertas.map((a) => {
                const Icon = a.icon
                return (
                  <Link
                    key={a.text}
                    href={a.href}
                    className="flex items-center gap-3 py-2.5 text-sm first:pt-0 last:pb-0 hover:text-primary"
                  >
                    <Icon className={`size-4 shrink-0 ${a.tone}`} />
                    <span className="flex-1 text-foreground">{a.text}</span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* 1.4.5.3 Próximos partidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Próximos partidos
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

        {/* 1.4.5.2 Estado de pagos — detalle */}
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

        {/* 1.4.5.4 Sanciones vigentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="size-4 text-danger" />
              Sanciones vigentes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {vigentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay sanciones vigentes.</p>
            ) : (
              vigentes.slice(0, 5).map((s) => {
                const j = jugador(s.jugadorId)
                return (
                  <Link
                    key={s.id}
                    href="/sanciones"
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{j ? j.nombre : nombreEquipo(s.equipoId)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {nombreEquipo(s.equipoId)} · {s.motivo}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-danger">
                      {s.tipo === "suspension"
                        ? `${fechasCumplidas(s, jornadaActual)}/${s.fechas} fechas`
                        : "Amonestación"}
                    </span>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
