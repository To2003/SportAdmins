"use client"

import { Plus, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { formatARS, type EstadoJornada } from "@/lib/data"
import { useTorneo } from "@/lib/torneo-store"

const ESTADOS: Record<EstadoJornada, { label: string; tone: "success" | "warning" | "neutral" | "danger" }> = {
  jugada: { label: "Jugada", tone: "success" },
  "en-curso": { label: "En curso", tone: "warning" },
  programada: { label: "Programada", tone: "neutral" },
  reprogramada: { label: "Reprogramada", tone: "danger" },
}

export function JornadasPanel() {
  const { jornadas, partidos, config, guardarJornada, agregarJornada } = useTorneo()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {jornadas.length} de {config.cantidadJornadas} jornadas planificadas. Cambiá la fecha para reprogramar.
        </p>
        <Button
          size="sm"
          onClick={() => {
            agregarJornada()
            toast.success("Jornada agregada", { description: "Se programó 7 días después de la última." })
          }}
        >
          <Plus className="size-4" />
          Agregar jornada
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {jornadas.map((j) => {
          const delDia = partidos.filter((p) => p.jornada === j.numero)
          const jugados = delDia.filter((p) => p.setsA !== null).length
          const est = ESTADOS[j.estado]
          return (
            <Card key={j.numero} className="p-0">
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-display font-semibold text-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    Jornada {j.numero}
                  </p>
                  <StatusBadge tone={est.tone}>{est.label}</StatusBadge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={j.fecha}
                    aria-label={`Fecha de la jornada ${j.numero}`}
                    onChange={(e) =>
                      guardarJornada({
                        ...j,
                        fecha: e.target.value,
                        estado: j.estado === "programada" ? "reprogramada" : j.estado,
                      })
                    }
                  />
                  <Select
                    value={j.estado}
                    onValueChange={(v) => guardarJornada({ ...j, estado: v as EstadoJornada })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ESTADOS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {delDia.length} partidos · {jugados} con resultado
                  </span>
                  <span className="font-mono font-medium text-foreground">Fee {formatARS(j.fee)}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
