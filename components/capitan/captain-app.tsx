"use client"

import { useMemo, useState } from "react"
import {
  Upload,
  Calendar,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  MapPin,
  IdCard,
  ArrowLeft,
  UserPlus,
  Ban,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PagoBadge, StatusBadge } from "@/components/status-badge"
import {
  equipoCapitan,
  formatARS,
  formatFecha,
  type Partido,
  type Jugador,
  type Deuda,
} from "@/lib/data"
import { useDeudas } from "@/lib/deudas-store"
import { sancionVigente, useTorneo } from "@/lib/torneo-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Tab = "inicio" | "plantel" | "pagos"

function rivalDe(p: Partido) {
  return p.equipoA === equipoCapitan.nombre ? p.equipoB : p.equipoA
}

function resultadoDe(p: Partido) {
  if (p.setsA === null || p.setsB === null) return null
  const propios = p.equipoA === equipoCapitan.nombre ? p.setsA : p.setsB
  const rival = p.equipoA === equipoCapitan.nombre ? p.setsB : p.setsA
  return { propios, rival, gano: propios > rival }
}

export function CaptainApp() {
  const [tab, setTab] = useState<Tab>("inicio")
  const { deudas, enviarComprobante } = useDeudas()
  const router = useRouter()
  const { partidos, jugadores: todosJugadores, guardarJugador, sanciones, jornadaActual, sesion, cerrarSesion } =
    useTorneo()
  const suspendidos = new Set(
    sanciones
      .filter((s) => s.tipo === "suspension" && s.jugadorId && sancionVigente(s, jornadaActual))
      .map((s) => s.jugadorId),
  )
  // Partidos del equipo del capitán (Los Topadores)
  const misPartidos: Partido[] = partidos.filter(
    (p) => p.equipoA === equipoCapitan.nombre || p.equipoB === equipoCapitan.nombre,
  )
  const jugadores = todosJugadores.filter((j) => j.equipoId === equipoCapitan.id)

  const [payOpen, setPayOpen] = useState(false)
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<Deuda | null>(null)

  const [addPlayerOpen, setAddPlayerOpen] = useState(false)
  const [nombreJugador, setNombreJugador] = useState("")
  const [numeroJugador, setNumeroJugador] = useState("")
  const [dniJugador, setDniJugador] = useState("")

  const misDeudas = useMemo(
    () =>
      deudas
        .filter((d) => d.equipoId === equipoCapitan.id)
        .sort((a, b) => b.creadoEl.localeCompare(a.creadoEl)),
    [deudas],
  )

  const pendientes = misDeudas.filter((d) => d.estado === "pendiente" || d.estado === "rechazado").length
  const proximo = misPartidos.find((p) => p.setsA === null)

  function abrirPago(d: Deuda) {
    setDeudaSeleccionada(d)
    setPayOpen(true)
  }

  function enviar() {
    if (!deudaSeleccionada) return
    enviarComprobante(deudaSeleccionada.id)
    setPayOpen(false)
    toast.success("Comprobante enviado", {
      description: `${deudaSeleccionada.concepto} quedó pendiente de validación por Tesorería.`,
    })
    setDeudaSeleccionada(null)
  }

  function agregarJugador() {
    if (!nombreJugador.trim() || !numeroJugador || !dniJugador.trim()) {
      toast.error("Completá los datos", { description: "Nombre, número y DNI son obligatorios." })
      return
    }
    const nuevo: Jugador = {
      id: `jc-${Date.now()}`,
      nombre: nombreJugador.trim(),
      numero: Number(numeroJugador),
      dni: dniJugador.trim(),
      equipoId: equipoCapitan.id,
    }
    guardarJugador(nuevo)
    toast.success("Jugador agregado", {
      description: `${nuevo.nombre} queda sujeto a la aprobación de la organización.`,
    })
    setNombreJugador("")
    setNumeroJugador("")
    setDniJugador("")
    setAddPlayerOpen(false)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 px-5 py-3.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-display text-lg font-bold">T</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold leading-tight">{equipoCapitan.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">Cap. {equipoCapitan.capitan}</p>
          </div>
          {sesion?.rol === "delegado" ? (
            <button
              type="button"
              onClick={() => {
                cerrarSesion()
                router.push("/login")
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" />
              Salir
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Admin
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5">
        {tab === "inicio" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-gradient-to-br from-primary to-accent-foreground p-5 text-primary-foreground">
              <p className="text-sm opacity-90">Próximo partido</p>
              {proximo ? (
                <>
                  <p className="mt-1 font-display text-xl font-bold text-balance">vs {rivalDe(proximo)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4" aria-hidden />
                      {formatFecha(proximo.fecha)} · {proximo.hora}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-4" aria-hidden />
                      {proximo.cancha.split(" — ")[0]}
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-1 font-display text-lg font-semibold">Sin partidos programados</p>
              )}
            </div>

            {pendientes > 0 && (
              <Card className="border-warning/40 bg-warning/10">
                <CardContent className="flex items-center gap-3">
                  <Clock className="size-5 shrink-0 text-warning-foreground" aria-hidden />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground">
                      Tenés {pendientes} deuda{pendientes > 1 ? "s" : ""} sin regularizar
                    </p>
                    <p className="text-muted-foreground">Subí el comprobante para evitar sanciones.</p>
                  </div>
                  <Button size="sm" onClick={() => setTab("pagos")}>
                    Ver
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Jugadores" value={`${jugadores.length}`} icon={Users} />
              <StatCard
                label="Pagos al día"
                value={`${misDeudas.filter((d) => d.estado === "aprobado").length}/${misDeudas.length}`}
                icon={CheckCircle2}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Últimos resultados</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 pt-0">
                {misPartidos
                  .filter((p) => p.setsA !== null)
                  .map((p) => {
                    const r = resultadoDe(p)!
                    return (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">vs {rivalDe(p)}</span>
                        <span className={cn("font-semibold tabular-nums", r.gano ? "text-success" : "text-danger")}>
                          {r.propios}-{r.rival}
                        </span>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "plantel" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">Mi plantel</h2>
                <p className="text-sm text-muted-foreground text-pretty">
                  Cargá tus jugadores; quedan sujetos a aprobación de la organización.
                </p>
              </div>
              <Button size="sm" className="shrink-0" onClick={() => setAddPlayerOpen(true)}>
                <UserPlus className="size-4" aria-hidden />
                Agregar
              </Button>
            </div>
            {jugadores.map((j) => (
              <Card key={j.id}>
                <CardContent className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-semibold text-primary">
                    {j.numero}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{j.nombre}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IdCard className="size-3" aria-hidden />
                      DNI {j.dni}
                    </p>
                  </div>
                  {suspendidos.has(j.id) && (
                    <StatusBadge tone="danger" icon={<Ban className="size-3" />}>
                      Suspendido
                    </StatusBadge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "pagos" && (
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Mis pagos</h2>
              <p className="text-sm text-muted-foreground text-pretty">
                Tocá "Pagar" en la deuda que quieras regularizar para adjuntar el comprobante.
              </p>
            </div>
            {misDeudas.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  Todavía no tenés deudas cargadas por la organización.
                </CardContent>
              </Card>
            ) : (
              misDeudas.map((d) => (
                <Card key={d.id}>
                  <CardContent className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.concepto}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <PagoBadge estado={d.estado} />
                        {d.estado === "en_revision" && (
                          <span className="text-xs text-muted-foreground">Esperando aprobación</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <p className="font-mono text-sm font-semibold tabular-nums">{formatARS(d.monto)}</p>
                      {(d.estado === "pendiente" || d.estado === "rechazado") && (
                        <Button size="sm" onClick={() => abrirPago(d)}>
                          <Upload className="size-3.5" aria-hidden />
                          Pagar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      <nav className="sticky bottom-0 grid grid-cols-3 border-t border-border bg-card/90 backdrop-blur">
        <NavButton active={tab === "inicio"} onClick={() => setTab("inicio")} icon={Calendar} label="Inicio" />
        <NavButton active={tab === "plantel"} onClick={() => setTab("plantel")} icon={Users} label="Plantel" />
        <NavButton
          active={tab === "pagos"}
          onClick={() => setTab("pagos")}
          icon={Wallet}
          label="Pagos"
          badge={pendientes}
        />
      </nav>

      <Dialog open={payOpen} onOpenChange={(o) => { setPayOpen(o); if (!o) setDeudaSeleccionada(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir comprobante</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {deudaSeleccionada && (
              <Card className="bg-muted/40">
                <CardContent className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground text-pretty">{deudaSeleccionada.concepto}</p>
                  <p className="shrink-0 font-mono text-sm font-semibold">{formatARS(deudaSeleccionada.monto)}</p>
                </CardContent>
              </Card>
            )}
            <label
              htmlFor="cap-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Upload className="size-6" aria-hidden />
              Tocá para adjuntar el comprobante
              <input id="cap-file" type="file" accept="image/*" className="sr-only" />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={enviar}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar jugador</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="player-name">Nombre y apellido</Label>
              <Input
                id="player-name"
                value={nombreJugador}
                onChange={(e) => setNombreJugador(e.target.value)}
                placeholder="Ej: Rocío Ferreyra"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="player-number">Número</Label>
                <Input
                  id="player-number"
                  type="number"
                  min={0}
                  value={numeroJugador}
                  onChange={(e) => setNumeroJugador(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="player-dni">DNI</Label>
                <Input
                  id="player-dni"
                  value={dniJugador}
                  onChange={(e) => setDniJugador(e.target.value)}
                  placeholder="Ej: 39.220.117"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPlayerOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={agregarJugador}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="size-4" aria-hidden />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1 py-2.5 text-xs transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <span className="relative">
        <Icon className="size-5" aria-hidden />
        {badge ? (
          <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-foreground">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </button>
  )
}
