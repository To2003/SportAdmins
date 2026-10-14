"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Phone, Lock, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { RosterBadge, SaldoBadge, StatusBadge } from "@/components/status-badge"
import { type Equipo } from "@/lib/data"
import { useTorneo } from "@/lib/torneo-store"

const vacio = { nombre: "", capitan: "", telefono: "" }

export function TeamsManager() {
  const { equipos, jugadores, guardarEquipo, eliminarEquipo, config } = useTorneo()
  const [editando, setEditando] = useState<Equipo | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(vacio)

  function abrirNuevo() {
    setEditando(null)
    setForm(vacio)
    setOpen(true)
  }

  function abrirEdicion(e: Equipo) {
    setEditando(e)
    setForm({ nombre: e.nombre, capitan: e.capitan, telefono: e.telefono })
    setOpen(true)
  }

  function guardar() {
    if (!form.nombre.trim() || !form.capitan.trim()) {
      toast.error("Completá los datos", { description: "El nombre del equipo y el delegado son obligatorios." })
      return
    }
    if (equipos.some((e) => e.nombre.toLowerCase() === form.nombre.trim().toLowerCase() && e.id !== editando?.id)) {
      toast.error("Ya existe un equipo con ese nombre")
      return
    }
    guardarEquipo(
      editando
        ? { ...editando, ...form, nombre: form.nombre.trim() }
        : {
            id: `e-${Date.now()}`,
            nombre: form.nombre.trim(),
            capitan: form.capitan.trim(),
            telefono: form.telefono.trim(),
            saldo: 0,
            ultimoPago: new Date().toISOString().slice(0, 10),
            bloqueado: false,
            roster: "sin-enviar",
          },
    )
    toast.success(editando ? "Equipo actualizado" : "Equipo inscripto", {
      description: editando ? form.nombre : `${form.nombre} se sumó a ${config.temporada}.`,
    })
    setOpen(false)
  }

  function eliminar(e: Equipo) {
    eliminarEquipo(e.id)
    toast.success("Equipo dado de baja", { description: e.nombre })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {equipos.length} equipos inscriptos en {config.temporada}
          {config.inscripcionAbierta ? " · inscripción abierta" : " · inscripción cerrada"}
        </p>
        <Button size="sm" onClick={abrirNuevo}>
          <Plus className="size-4" />
          Inscribir equipo
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {equipos.map((e) => {
          const cant = jugadores.filter((j) => j.equipoId === e.id).length
          return (
            <Card key={e.id} className="p-0">
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{e.nombre}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Phone className="size-3" />
                      {e.capitan} {e.telefono && `· ${e.telefono}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => abrirEdicion(e)} aria-label={`Editar ${e.nombre}`}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-danger hover:text-danger"
                      onClick={() => eliminar(e)}
                      aria-label={`Dar de baja ${e.nombre}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <RosterBadge estado={e.roster} />
                  <SaldoBadge saldo={e.saldo} />
                  {e.bloqueado && (
                    <StatusBadge tone="danger" icon={<Lock className="size-3" />}>
                      Bloqueado
                    </StatusBadge>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {cant} jugadores en lista
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar equipo" : "Inscribir equipo"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Actualizá los datos del equipo y su delegado."
                : "El delegado recibirá una invitación para cargar la lista de buena fe."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="eq-nombre">Nombre del equipo</Label>
              <Input
                id="eq-nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Las Panteras VC"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eq-capitan">Delegado / capitán</Label>
              <Input
                id="eq-capitan"
                value={form.capitan}
                onChange={(e) => setForm({ ...form, capitan: e.target.value })}
                placeholder="Nombre y apellido"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eq-tel">Teléfono (WhatsApp)</Label>
              <Input
                id="eq-tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="+54 9 11 ..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardar}>{editando ? "Guardar cambios" : "Inscribir"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
