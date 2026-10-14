"use client"

import { useMemo, useState } from "react"
import { Sparkles, Plus, MapPin, Clock, Pencil, Trophy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/status-badge"
import { canchas, convocatorias as convocatoriasSeed, formatFecha, type Partido } from "@/lib/data"
import { sancionVigente, useTorneo } from "@/lib/torneo-store"

export function FixtureBoard() {
  const { partidos, setPartidos, equipos, jugadores: todosJugadores, jornadas: jornadasConfig, jornadaActual, sanciones } = useTorneo()
  const suspendidos = new Set(
    sanciones
      .filter((s) => s.tipo === "suspension" && s.jugadorId && sancionVigente(s, jornadaActual))
      .map((s) => s.jugadorId),
  )
  const [editing, setEditing] = useState<Partido | null>(null)
  const [setsA, setSetsA] = useState("")
  const [setsB, setSetsB] = useState("")
  const [convocatoriaState, setConvocatoriaState] = useState<Record<string, string[]>>(convocatoriasSeed)
  const [presentes, setPresentes] = useState<string[]>([])

  // Form state
  const [equipoA, setEquipoA] = useState("")
  const [equipoB, setEquipoB] = useState("")
  const [cancha, setCancha] = useState("")
  const [hora, setHora] = useState("")
  const [jornada, setJornada] = useState(String(jornadaActual + 1))

  const jornadas = useMemo(() => {
    const grupos = new Map<number, Partido[]>()
    for (const p of partidos) {
      if (!grupos.has(p.jornada)) grupos.set(p.jornada, [])
      grupos.get(p.jornada)!.push(p)
    }
    return Array.from(grupos.entries()).sort((a, b) => b[0] - a[0])
  }, [partidos])

  function generarAutomatico() {
    toast.success("Fixture generado", {
      description: "Se armó el cruce completo respetando descansos y canchas disponibles.",
    })
  }

  function agregarPartido() {
    if (!equipoA || !equipoB || equipoA === equipoB || !cancha || !hora) {
      toast.error("Completá los datos", { description: "Elegí dos equipos distintos, cancha y horario." })
      return
    }
    const nuevo: Partido = {
      id: `p${Date.now()}`,
      jornada: Number(jornada),
      fecha: jornadasConfig.find((j) => j.numero === Number(jornada))?.fecha ?? jornadasConfig[jornadasConfig.length - 1].fecha,
      equipoA,
      equipoB,
      cancha,
      hora,
      setsA: null,
      setsB: null,
    }
    setPartidos((prev) => [...prev, nuevo])
    toast.success("Partido agregado", { description: `${equipoA} vs ${equipoB}` })
    setEquipoA("")
    setEquipoB("")
    setCancha("")
    setHora("")
  }

  function rosterDe(equipoNombre: string) {
    const equipoId = equipos.find((e) => e.nombre === equipoNombre)?.id
    return equipoId ? todosJugadores.filter((j) => j.equipoId === equipoId) : []
  }

  function abrirResultado(p: Partido) {
    setEditing(p)
    setSetsA(p.setsA?.toString() ?? "")
    setSetsB(p.setsB?.toString() ?? "")
    setPresentes(convocatoriaState[p.id] ?? [])
  }

  function togglePresente(jugadorId: string) {
    setPresentes((prev) => (prev.includes(jugadorId) ? prev.filter((id) => id !== jugadorId) : [...prev, jugadorId]))
  }

  function guardarResultado() {
    if (!editing) return
    setPartidos((prev) =>
      prev.map((p) => (p.id === editing.id ? { ...p, setsA: Number(setsA), setsB: Number(setsB) } : p)),
    )
    setConvocatoriaState((prev) => ({ ...prev, [editing.id]: presentes }))
    toast.success("Resultado cargado", {
      description: `${editing.equipoA} ${setsA} - ${setsB} ${editing.equipoB}${
        presentes.length ? ` · ${presentes.length} jugadores presentes` : ""
      }`,
    })
    setEditing(null)
  }

  return (
    <div className="space-y-5">
      <Button size="lg" className="w-full gap-2 sm:w-auto" onClick={generarAutomatico}>
        <Sparkles className="size-4.5" />
        Generar fixture automático
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Plus className="size-4 text-primary" />
            Agregar partido manualmente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-xs">Equipo local</Label>
            <Select value={equipoA} onValueChange={(v) => setEquipoA(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegir" />
              </SelectTrigger>
              <SelectContent>
                {equipos.map((e) => (
                  <SelectItem key={e.id} value={e.nombre}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-xs">Equipo visitante</Label>
            <Select value={equipoB} onValueChange={(v) => setEquipoB(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegir" />
              </SelectTrigger>
              <SelectContent>
                {equipos.map((e) => (
                  <SelectItem key={e.id} value={e.nombre}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
            <Label className="text-xs">Cancha</Label>
            <Select value={cancha} onValueChange={(v) => setCancha(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegir cancha" />
              </SelectTrigger>
              <SelectContent>
                {canchas.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Jornada</Label>
            <Input type="number" min={1} value={jornada} onChange={(e) => setJornada(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Horario</Label>
            <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-4">
            <Button className="w-full sm:w-auto" onClick={agregarPartido}>
              <Plus className="size-4" />
              Agregar al fixture
            </Button>
          </div>
        </CardContent>
      </Card>

      {jornadas.map(([num, lista]) => (
        <section key={num} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">Jornada {num}</h2>
            <span className="text-xs text-muted-foreground">{formatFecha(lista[0].fecha)}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {lista.map((p) => {
              const jugado = p.setsA !== null && p.setsB !== null
              const ganaA = jugado && p.setsA! > p.setsB!
              const ganaB = jugado && p.setsB! > p.setsA!
              return (
                <Card key={p.id} className="p-0">
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        <span className="truncate">{p.cancha}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                        <Clock className="size-3.5" />
                        {p.hora}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className={ganaA ? "font-semibold text-foreground" : "text-foreground"}>{p.equipoA}</span>
                      {jugado ? (
                        <span className="font-mono text-lg font-bold text-foreground">
                          {p.setsA} - {p.setsB}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">vs</span>
                      )}
                      <span className={ganaB ? "font-semibold text-foreground text-right" : "text-foreground text-right"}>
                        {p.equipoB}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {jugado ? (
                        <StatusBadge tone="success" icon={<Trophy className="size-3" />}>
                          Finalizado
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="warning">Programado</StatusBadge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => abrirResultado(p)}>
                        <Pencil className="size-3.5" />
                        {jugado ? "Editar resultado" : "Cargar resultado"}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      ))}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar resultado</DialogTitle>
            <DialogDescription>Ingresá los sets ganados por cada equipo.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="flex items-end justify-center gap-4 py-2">
              <div className="flex-1 space-y-1.5 text-center">
                <Label className="line-clamp-1 text-xs">{editing.equipoA}</Label>
                <Input
                  type="number"
                  min={0}
                  max={3}
                  value={setsA}
                  onChange={(e) => setSetsA(e.target.value)}
                  className="text-center text-lg font-semibold"
                />
              </div>
              <span className="pb-2 text-muted-foreground">-</span>
              <div className="flex-1 space-y-1.5 text-center">
                <Label className="line-clamp-1 text-xs">{editing.equipoB}</Label>
                <Input
                  type="number"
                  min={0}
                  max={3}
                  value={setsB}
                  onChange={(e) => setSetsB(e.target.value)}
                  className="text-center text-lg font-semibold"
                />
              </div>
            </div>
          ) : null}

          {editing
            ? [editing.equipoA, editing.equipoB].map((equipoNombre) => {
                const roster = rosterDe(equipoNombre)
                if (roster.length === 0) return null
                return (
                  <div key={equipoNombre} className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Jugadores presentes — {equipoNombre}</p>
                    <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                      {roster.map((j) => (
                        <label key={j.id} className="flex items-center justify-between gap-2 py-1 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate">
                              #{j.numero} {j.nombre}
                            </span>
                            {suspendidos.has(j.id) && <StatusBadge tone="danger">Suspendido</StatusBadge>}
                          </span>
                          <Switch
                            checked={presentes.includes(j.id)}
                            disabled={suspendidos.has(j.id)}
                            onCheckedChange={() => togglePresente(j.id)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })
            : null}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={guardarResultado}>Guardar resultado</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
