"use client"

import { useState } from "react"
import { Users, Check, X, MessageSquare, IdCard, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { RosterBadge } from "@/components/status-badge"
import { equipos as equiposData, rostersEjemplo, type Equipo, type EstadoRoster } from "@/lib/data"

export function RosterManager() {
  const [equipos, setEquipos] = useState<Equipo[]>(equiposData)
  const [detalle, setDetalle] = useState<Equipo | null>(null)
  const [rechazando, setRechazando] = useState(false)
  const [comentario, setComentario] = useState("")

  function abrir(e: Equipo) {
    setDetalle(e)
    setRechazando(false)
    setComentario("")
  }

  function setEstado(id: string, estado: EstadoRoster) {
    setEquipos((prev) => prev.map((e) => (e.id === id ? { ...e, roster: estado } : e)))
  }

  function aprobar() {
    if (!detalle) return
    setEstado(detalle.id, "aprobado")
    toast.success("Lista aprobada", { description: detalle.nombre })
    setDetalle(null)
  }

  function rechazar() {
    if (!detalle) return
    if (!comentario.trim()) {
      toast.error("Escribí un comentario", { description: "Indicá el motivo del rechazo para el capitán." })
      return
    }
    setEstado(detalle.id, "sin-enviar")
    toast.error("Lista rechazada", { description: `${detalle.nombre}: ${comentario}` })
    setDetalle(null)
  }

  const jugadores = detalle ? rostersEjemplo[detalle.id] ?? [] : []
  const grupos: { titulo: string; estados: EstadoRoster[] }[] = [
    { titulo: "Pendientes de aprobación", estados: ["pendiente"] },
    { titulo: "Aprobados", estados: ["aprobado"] },
    { titulo: "Sin enviar", estados: ["sin-enviar"] },
  ]

  return (
    <div className="space-y-6">
      {grupos.map((g) => {
        const lista = equipos.filter((e) => g.estados.includes(e.roster))
        if (lista.length === 0) return null
        return (
          <section key={g.titulo} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {g.titulo} <span className="text-muted-foreground/70">({lista.length})</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((e) => {
                const cant = rostersEjemplo[e.id]?.length ?? 0
                const puedeVer = e.roster !== "sin-enviar"
                return (
                  <Card key={e.id} className="p-0">
                    <div className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                            <Users className="size-4.5" />
                          </span>
                          <div>
                            <p className="font-medium leading-tight text-foreground">{e.nombre}</p>
                            <p className="text-xs text-muted-foreground">{e.capitan}</p>
                          </div>
                        </div>
                        <RosterBadge estado={e.roster} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {puedeVer ? `${cant} jugadores cargados` : "Sin lista cargada"}
                        </span>
                        <Button
                          variant={e.roster === "pendiente" ? "default" : "outline"}
                          size="sm"
                          disabled={!puedeVer}
                          onClick={() => abrir(e)}
                        >
                          Ver lista
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}

      <Dialog open={detalle !== null} onOpenChange={(o) => !o && setDetalle(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lista de buena fe — {detalle?.nombre}</DialogTitle>
            <DialogDescription>
              Cargada por {detalle?.capitan} · {jugadores.length} jugadores
            </DialogDescription>
          </DialogHeader>

          <ul className="max-h-[45vh] divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {jugadores.map((j) => (
              <li key={j.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-sm font-semibold text-primary">
                  {j.numero}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{j.nombre}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IdCard className="size-3" />
                    DNI {j.dni}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {rechazando ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Motivo del rechazo (ej: falta DNI del jugador #12, jugador no habilitado...)"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setRechazando(false)}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-danger text-danger-foreground hover:bg-danger/90"
                  onClick={rechazar}
                >
                  <X className="size-4" />
                  Confirmar rechazo
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRechazando(true)}>
                <MessageSquare className="size-4" />
                Rechazar con comentario
              </Button>
              <Button className="flex-1 bg-success text-success-foreground hover:bg-success/90" onClick={aprobar}>
                <Check className="size-4" />
                Aprobar lista
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
