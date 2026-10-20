"use client"

import { useMemo, useState } from "react"
import { Sparkles, Plus, MapPin, Clock, Pencil, Trophy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { canchas, formatFecha, type Partido } from "@/lib/data"
import { generarRoundRobin, useTorneo } from "@/lib/torneo-store"

export function FixtureBoard() {
  const {
    partidos: todos,
    setPartidos,
    equipos,
    jornadas: jornadasConfig,
    agregarJornada,
    jornadaActual,
    config,
    puede,
    equipoSesion,
  } = useTorneo()
  const gestiona = puede("fixture.gestionar")
  const cargaResultados = puede("resultados.cargar")
  // El delegado solo ve los partidos de su equipo
  const miEquipo = equipos.find((e) => e.id === equipoSesion)?.nombre
  const partidos = useMemo(
    () => (equipoSesion ? todos.filter((p) => p.equipoA === miEquipo || p.equipoB === miEquipo) : todos),
    [todos, equipoSesion, miEquipo],
  )
  const [editing, setEditing] = useState<Partido | null>(null)
  const [setsA, setSetsA] = useState("")
  const [setsB, setSetsB] = useState("")

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

  // 1.4.2.5: todos contra todos a una ronda, una jornada por ronda. Cancha y horario se definen después.
  function generarAutomatico() {
    if (equipos.length < 2) {
      toast.error("Hacen falta al menos 2 equipos participantes")
      return
    }
    const conResultado = todos.filter((p) => p.setsA !== null).length
    if (
      todos.length > 0 &&
      !window.confirm(
        `Se va a reemplazar el fixture actual (${todos.length} partidos${
          conResultado ? `, ${conResultado} con resultado cargado` : ""
        }). ¿Continuar?`,
      )
    )
      return
    const fechaDe = (numero: number) => {
      const j = jornadasConfig.find((x) => x.numero === numero)
      if (j) return j.fecha
      const d = new Date(config.fechaInicio)
      d.setDate(d.getDate() + 7 * (numero - 1))
      return d.toISOString().slice(0, 10)
    }
    const rondas = generarRoundRobin(equipos.map((e) => e.nombre))
    // Crear las jornadas que falten para que aparezcan (y se puedan reprogramar) en la pestaña Jornadas
    for (let n = jornadasConfig.length; n < rondas.length; n++) agregarJornada()
    setPartidos(
      rondas.flatMap((ronda, r) =>
        ronda.map(([a, b], i) => ({
          id: `p-${r + 1}-${i + 1}`,
          jornada: r + 1,
          fecha: fechaDe(r + 1),
          equipoA: a,
          equipoB: b,
          cancha: "A definir",
          hora: "A definir",
          setsA: null,
          setsB: null,
        })),
      ),
    )
    toast.success("Fixture generado", {
      description: `${rondas.length} jornadas · ${rondas.reduce((n, r) => n + r.length, 0)} partidos (todos contra todos).`,
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

  function abrirResultado(p: Partido) {
    setEditing(p)
    setSetsA(p.setsA?.toString() ?? "")
    setSetsB(p.setsB?.toString() ?? "")
  }

  function guardarResultado() {
    if (!editing) return
    setPartidos((prev) =>
      prev.map((p) => (p.id === editing.id ? { ...p, setsA: Number(setsA), setsB: Number(setsB) } : p)),
    )
    toast.success("Resultado cargado", {
      description: `${editing.equipoA} ${setsA} - ${setsB} ${editing.equipoB}`,
    })
    setEditing(null)
  }

  return (
    <div className="space-y-5">
      {gestiona && (
        <Button size="lg" className="w-full gap-2 sm:w-auto" onClick={generarAutomatico}>
          <Sparkles className="size-4.5" />
          Generar fixture automático
        </Button>
      )}

      {gestiona && (
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
      )}

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
                      {cargaResultados && (
                        <Button variant="outline" size="sm" onClick={() => abrirResultado(p)}>
                          <Pencil className="size-3.5" />
                          {jugado ? "Editar resultado" : "Cargar resultado"}
                        </Button>
                      )}
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
