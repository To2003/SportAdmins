"use client"

import { useMemo, useState } from "react"
import { Plus, Pencil, Trash2, Ban } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlayoffBadge, StatusBadge } from "@/components/status-badge"
import { convocatorias, type Jugador } from "@/lib/data"
import { sancionVigente, useTorneo } from "@/lib/torneo-store"

const vacio = { nombre: "", numero: "", dni: "", equipoId: "" }

export function PlayersPanel() {
  const { jugadores, equipos, partidos, sanciones, jornadaActual, config, guardarJugador, eliminarJugador } =
    useTorneo()
  const [filtro, setFiltro] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Jugador | null>(null)
  const [form, setForm] = useState(vacio)

  const suspendidos = useMemo(
    () =>
      new Set(
        sanciones
          .filter((s) => s.tipo === "suspension" && s.jugadorId && sancionVigente(s, jornadaActual))
          .map((s) => s.jugadorId),
      ),
    [sanciones, jornadaActual],
  )

  const filas = useMemo(
    () =>
      jugadores
        .filter((j) => filtro === "todos" || j.equipoId === filtro)
        .filter((j) => !busqueda || `${j.nombre} ${j.dni}`.toLowerCase().includes(busqueda.toLowerCase()))
        .map((j) => ({
          ...j,
          equipoNombre: equipos.find((e) => e.id === j.equipoId)?.nombre ?? "—",
          jugados: partidos.filter((p) => p.setsA !== null && convocatorias[p.id]?.includes(j.id)).length,
          suspendido: suspendidos.has(j.id),
        }))
        .sort((a, b) => a.equipoNombre.localeCompare(b.equipoNombre) || a.numero - b.numero),
    [jugadores, equipos, partidos, filtro, busqueda, suspendidos],
  )

  function abrirNuevo() {
    setEditando(null)
    setForm({ ...vacio, equipoId: filtro === "todos" ? "" : filtro })
    setOpen(true)
  }

  function abrirEdicion(j: Jugador) {
    setEditando(j)
    setForm({ nombre: j.nombre, numero: String(j.numero), dni: j.dni, equipoId: j.equipoId })
    setOpen(true)
  }

  function guardar() {
    if (!form.nombre.trim() || !form.numero || !form.dni.trim() || !form.equipoId) {
      toast.error("Completá los datos", { description: "Nombre, número, DNI y equipo son obligatorios." })
      return
    }
    if (jugadores.some((j) => j.dni === form.dni.trim() && j.id !== editando?.id)) {
      toast.error("DNI duplicado", { description: "Ese jugador ya está inscripto en otro equipo." })
      return
    }
    guardarJugador({
      id: editando?.id ?? `j-${Date.now()}`,
      nombre: form.nombre.trim(),
      numero: Number(form.numero),
      dni: form.dni.trim(),
      equipoId: form.equipoId,
    })
    toast.success(editando ? "Jugador actualizado" : "Jugador agregado", { description: form.nombre })
    setOpen(false)
  }

  function eliminar(j: Jugador) {
    eliminarJugador(j.id)
    toast.success("Jugador dado de baja", { description: j.nombre })
  }

  const acciones = (j: Jugador) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => abrirEdicion(j)} aria-label={`Editar ${j.nombre}`}>
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-danger hover:text-danger"
        onClick={() => eliminar(j)}
        aria-label={`Dar de baja ${j.nombre}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )

  const estado = (j: (typeof filas)[number]) =>
    j.suspendido ? (
      <StatusBadge tone="danger" icon={<Ban className="size-3" />}>
        Suspendido
      </StatusBadge>
    ) : (
      <PlayoffBadge jugados={j.jugados} />
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Buscar por nombre o DNI"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="sm:w-56"
          />
          <Select value={filtro} onValueChange={(v) => setFiltro(v as string)}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Todos los equipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los equipos</SelectItem>
              {equipos.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={abrirNuevo}>
          <Plus className="size-4" />
          Agregar jugador
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-pretty">
        {filas.length} jugadores · para jugar el playoff cada jugador necesita al menos {config.minimoPartidosPlayoff}{" "}
        partidos en la fase regular.
      </p>

      {/* Desktop table */}
      <Card className="hidden p-0 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Jugador</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead className="text-right">PJ</TableHead>
              <TableHead className="text-right">Estado</TableHead>
              <TableHead className="pr-4 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                      {j.numero}
                    </span>
                    <span className="font-medium text-foreground">{j.nombre}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{j.dni}</TableCell>
                <TableCell className="text-muted-foreground">{j.equipoNombre}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-foreground">
                  {j.jugados}/{config.minimoPartidosPlayoff}
                </TableCell>
                <TableCell className="text-right">{estado(j)}</TableCell>
                <TableCell className="pr-4">{acciones(j)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {filas.map((j) => (
          <li key={j.id}>
            <Card>
              <div className="flex items-center justify-between gap-3 px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                    {j.numero}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{j.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {j.equipoNombre} · DNI {j.dni}
                    </p>
                  </div>
                </div>
                {acciones(j)}
              </div>
              <div className="flex items-center justify-between gap-3 px-4">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {j.jugados}/{config.minimoPartidosPlayoff} PJ
                </span>
                {estado(j)}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar jugador" : "Agregar jugador"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-2">
              <Label>Equipo</Label>
              <Select value={form.equipoId} onValueChange={(v) => setForm({ ...form, equipoId: v as string })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elegí un equipo" />
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
              <Label htmlFor="adm-player-name">Nombre y apellido</Label>
              <Input
                id="adm-player-name"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="adm-player-number">Número</Label>
                <Input
                  id="adm-player-number"
                  type="number"
                  min={0}
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adm-player-dni">DNI</Label>
                <Input
                  id="adm-player-dni"
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardar}>{editando ? "Guardar" : "Agregar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
