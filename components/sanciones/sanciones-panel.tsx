"use client"

import { useMemo, useState } from "react"
import { Plus, Ban, AlertTriangle, Coins, History, ShieldAlert, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/status-badge"
import { PageHeader } from "@/components/page-header"
import { TIPOS_SANCION, formatARS, formatFecha, type Sancion, type TipoSancion } from "@/lib/data"
import { fechasCumplidas, sancionVigente, useTorneo } from "@/lib/torneo-store"
import { cn } from "@/lib/utils"

const EQUIPO_COMPLETO = "__equipo__"

function TipoBadge({ tipo }: { tipo: TipoSancion }) {
  if (tipo === "suspension")
    return (
      <StatusBadge tone="danger" icon={<Ban className="size-3" />}>
        Suspensión
      </StatusBadge>
    )
  if (tipo === "multa")
    return (
      <StatusBadge tone="warning" icon={<Coins className="size-3" />}>
        Multa
      </StatusBadge>
    )
  return (
    <StatusBadge tone="neutral" icon={<AlertTriangle className="size-3" />}>
      Amonestación
    </StatusBadge>
  )
}

export function SancionesPanel() {
  const { sanciones: todas, equipos, jugadores, jornadaActual, crearSancion, anularSancion, puede, equipoSesion } =
    useTorneo()
  const gestiona = puede("sanciones.gestionar")
  // El delegado solo ve las sanciones de su equipo
  const sanciones = useMemo(
    () => (equipoSesion ? todas.filter((s) => s.equipoId === equipoSesion) : todas),
    [todas, equipoSesion],
  )

  const [open, setOpen] = useState(false)
  const [equipoId, setEquipoId] = useState("")
  const [jugadorId, setJugadorId] = useState(EQUIPO_COMPLETO)
  const [tipo, setTipo] = useState<TipoSancion>("suspension")
  const [motivo, setMotivo] = useState("")
  const [fechas, setFechas] = useState("1")
  const [monto, setMonto] = useState("")
  const [jornadaInicio, setJornadaInicio] = useState(String(jornadaActual))

  const nombreEquipo = (id: string) => equipos.find((e) => e.id === id)?.nombre ?? "—"
  const jugador = (id?: string) => jugadores.find((j) => j.id === id)

  const vigentes = useMemo(() => sanciones.filter((s) => sancionVigente(s, jornadaActual)), [sanciones, jornadaActual])
  const suspendidos = vigentes.filter((s) => s.tipo === "suspension")
  const multasTotal = sanciones.filter((s) => s.tipo === "multa" && !s.anulada).reduce((a, s) => a + (s.monto ?? 0), 0)

  function limpiar() {
    setEquipoId("")
    setJugadorId(EQUIPO_COMPLETO)
    setTipo("suspension")
    setMotivo("")
    setFechas("1")
    setMonto("")
    setJornadaInicio(String(jornadaActual))
  }

  function registrar() {
    if (!equipoId || !motivo.trim()) {
      toast.error("Completá los datos", { description: "Elegí el equipo y escribí el motivo." })
      return
    }
    if (tipo === "suspension" && (jugadorId === EQUIPO_COMPLETO || Number(fechas) < 1)) {
      toast.error("Suspensión incompleta", { description: "Elegí el jugador y al menos 1 fecha de suspensión." })
      return
    }
    if (tipo === "multa" && !(Number(monto) > 0)) {
      toast.error("Ingresá el monto de la multa")
      return
    }
    crearSancion({
      equipoId,
      jugadorId: jugadorId === EQUIPO_COMPLETO ? undefined : jugadorId,
      tipo,
      motivo: motivo.trim(),
      jornadaInicio: Number(jornadaInicio),
      fechas: tipo === "suspension" ? Number(fechas) : 0,
      monto: tipo === "multa" ? Number(monto) : undefined,
    })
    toast.success("Sanción registrada", {
      description: `${jugador(jugadorId)?.nombre ?? nombreEquipo(equipoId)} · ${TIPOS_SANCION[tipo]}`,
    })
    limpiar()
    setOpen(false)
  }

  function estadoDe(s: Sancion) {
    if (s.anulada) return <StatusBadge tone="neutral">Anulada</StatusBadge>
    if (sancionVigente(s, jornadaActual)) return <StatusBadge tone="danger">Vigente</StatusBadge>
    return <StatusBadge tone="success">Cumplida</StatusBadge>
  }

  const stats = [
    { label: "Jugadores suspendidos", value: suspendidos.length, icon: Ban, tone: "text-danger" },
    { label: "Sanciones vigentes", value: vigentes.length, icon: ShieldAlert, tone: "text-foreground" },
    { label: "Multas aplicadas", value: formatARS(multasTotal), icon: Coins, tone: "text-warning-foreground" },
  ]

  return (
    <>
      <PageHeader title="Sanciones" description={`Registro disciplinario del torneo · Jornada ${jornadaActual}`}>
        {gestiona && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Registrar sanción
          </Button>
        )}
      </PageHeader>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="flex flex-col gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="size-4" />
                </span>
                <p className={cn("font-display text-xl font-bold", s.tone)}>{s.value}</p>
                <p className="text-xs text-muted-foreground text-pretty">{s.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="vigentes" className="gap-5">
        <TabsList className="h-9 w-full max-w-md">
          <TabsTrigger value="vigentes">
            <Ban className="size-4" />
            Sancionados
          </TabsTrigger>
          <TabsTrigger value="historial">
            <History className="size-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vigentes">
          {vigentes.length === 0 ? (
            <Card className="py-12 text-center text-sm text-muted-foreground">No hay sanciones vigentes.</Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {vigentes.map((s) => {
                const j = jugador(s.jugadorId)
                const cumplidas = fechasCumplidas(s, jornadaActual)
                return (
                  <Card key={s.id} className="p-0">
                    <div className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {j ? `#${j.numero} ${j.nombre}` : "Equipo completo"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{nombreEquipo(s.equipoId)}</p>
                        </div>
                        <TipoBadge tipo={s.tipo} />
                      </div>
                      <p className="text-sm text-muted-foreground text-pretty">{s.motivo}</p>
                      {s.tipo === "suspension" && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Desde jornada {s.jornadaInicio} · {s.fechas} fecha{s.fechas > 1 ? "s" : ""}
                            </span>
                            <span className="font-medium text-foreground">
                              {cumplidas}/{s.fechas} cumplidas
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-danger"
                              style={{ width: `${(cumplidas / s.fechas) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Vuelve a estar habilitado en la jornada {s.jornadaInicio + s.fechas}.
                          </p>
                        </div>
                      )}
                      {gestiona && (
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              anularSancion(s.id)
                              toast.success("Sanción anulada")
                            }}
                          >
                            <Undo2 className="size-3.5" />
                            Anular
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial">
          <Card className="p-0">
            <ul className="divide-y divide-border">
              {sanciones.map((s) => {
                const j = jugador(s.jugadorId)
                return (
                  <li key={s.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{j ? j.nombre : "Equipo completo"}</span>
                        <span className="text-xs text-muted-foreground">· {nombreEquipo(s.equipoId)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground text-pretty">
                        {s.motivo}
                        {s.tipo === "suspension" && ` · ${s.fechas} fecha${s.fechas > 1 ? "s" : ""}`}
                        {s.monto ? ` · ${formatARS(s.monto)}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Jornada {s.jornadaInicio} · registrada el {formatFecha(s.creadaEl)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <TipoBadge tipo={s.tipo} />
                      {estadoDe(s)}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) limpiar()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar sanción</DialogTitle>
            <DialogDescription>Registrá una amonestación, suspensión por fechas o multa.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoSancion)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS_SANCION).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Equipo</Label>
                <Select
                  value={equipoId}
                  onValueChange={(v) => {
                    setEquipoId(v as string)
                    setJugadorId(EQUIPO_COMPLETO)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Elegir" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Jugador</Label>
                <Select value={jugadorId} onValueChange={(v) => setJugadorId(v as string)} disabled={!equipoId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EQUIPO_COMPLETO}>Equipo completo</SelectItem>
                    {jugadores
                      .filter((j) => j.equipoId === equipoId)
                      .map((j) => (
                        <SelectItem key={j.id} value={j.id}>
                          #{j.numero} {j.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="san-jornada">Desde jornada</Label>
                <Input
                  id="san-jornada"
                  type="number"
                  min={1}
                  value={jornadaInicio}
                  onChange={(e) => setJornadaInicio(e.target.value)}
                />
              </div>
              {tipo === "suspension" && (
                <div className="grid gap-2">
                  <Label htmlFor="san-fechas">Fechas de suspensión</Label>
                  <Input
                    id="san-fechas"
                    type="number"
                    min={1}
                    value={fechas}
                    onChange={(e) => setFechas(e.target.value)}
                  />
                </div>
              )}
              {tipo === "multa" && (
                <div className="grid gap-2">
                  <Label htmlFor="san-monto">Monto (ARS)</Label>
                  <Input
                    id="san-monto"
                    type="number"
                    min={0}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="san-motivo">Motivo</Label>
              <Textarea
                id="san-motivo"
                rows={2}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Agresión verbal al árbitro"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={registrar}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
