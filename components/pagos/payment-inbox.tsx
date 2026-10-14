"use client"

import { useMemo, useState } from "react"
import { Check, X, Clock, Inbox, ZoomIn } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { formatARS, formatFechaHora, type Deuda } from "@/lib/data"
import { useDeudas } from "@/lib/deudas-store"
import { useTorneo } from "@/lib/torneo-store"

export function PaymentInbox() {
  const { deudas, aprobarDeuda, rechazarDeuda } = useDeudas()
  const { equipos } = useTorneo()
  const nombreEquipo = (equipoId: string) => equipos.find((e) => e.id === equipoId)?.nombre ?? "—"
  const [equipoFilter, setEquipoFilter] = useState<string>("todos")
  const [preview, setPreview] = useState<Deuda | null>(null)

  const items = useMemo(() => deudas.filter((d) => d.estado === "en_revision"), [deudas])

  const equiposUnicos = useMemo(
    () => Array.from(new Set(items.map((d) => nombreEquipo(d.equipoId)))).sort(),
    [items],
  )

  const visibles = useMemo(
    () => (equipoFilter === "todos" ? items : items.filter((d) => nombreEquipo(d.equipoId) === equipoFilter)),
    [items, equipoFilter],
  )

  function resolver(d: Deuda, accion: "aprobar" | "rechazar") {
    if (accion === "aprobar") {
      aprobarDeuda(d.id)
      toast.success("Pago aprobado", { description: `${nombreEquipo(d.equipoId)} · ${formatARS(d.monto)}` })
    } else {
      rechazarDeuda(d.id)
      toast.error("Pago rechazado", { description: `${nombreEquipo(d.equipoId)} · ${d.concepto}` })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-warning/15 text-warning-foreground">
            <Clock className="size-5" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold leading-none text-foreground">{items.length}</p>
            <p className="text-xs text-muted-foreground">comprobantes pendientes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Equipo</span>
          <Select value={equipoFilter} onValueChange={(v) => setEquipoFilter(v as string)}>
            <SelectTrigger className="w-48" size="default">
              <SelectValue placeholder="Todos los equipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los equipos</SelectItem>
              {equiposUnicos.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visibles.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-success/12 text-success">
            <Inbox className="size-6" />
          </span>
          <p className="text-sm font-medium text-foreground">Buzón al día</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            No quedan comprobantes pendientes para revisar con este filtro.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {visibles.map((c) => (
            <li key={c.id}>
              <Card className="p-0">
                <div className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center sm:p-4">
                  <button
                    type="button"
                    onClick={() => setPreview(c)}
                    className="group relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-20 sm:aspect-square"
                    aria-label={`Ampliar comprobante de ${nombreEquipo(c.equipoId)}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.comprobanteImagen || "/placeholder.svg"}
                      alt={`Comprobante de ${nombreEquipo(c.equipoId)}`}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
                      <ZoomIn className="size-5" />
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{nombreEquipo(c.equipoId)}</p>
                    <p className="text-sm text-muted-foreground text-pretty">{c.concepto}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-mono text-base font-semibold text-foreground">{formatARS(c.monto)}</span>
                      <span className="text-xs text-muted-foreground">
                        Subido {c.comprobanteSubidoEl ? formatFechaHora(c.comprobanteSubidoEl) : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                    <Button
                      variant="outline"
                      className="h-11 border-danger/30 text-danger hover:bg-danger/10 hover:text-danger sm:h-9"
                      onClick={() => resolver(c, "rechazar")}
                    >
                      <X className="size-4" />
                      Rechazar
                    </Button>
                    <Button
                      className="h-11 bg-success text-success-foreground hover:bg-success/90 sm:h-9"
                      onClick={() => resolver(c, "aprobar")}
                    >
                      <Check className="size-4" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={preview !== null} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{preview ? nombreEquipo(preview.equipoId) : ""}</DialogTitle>
            <DialogDescription>
              {preview?.concepto} · {preview ? formatARS(preview.monto) : ""}
            </DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.comprobanteImagen || "/placeholder.svg"}
                alt={`Comprobante ampliado de ${nombreEquipo(preview.equipoId)}`}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
          ) : null}
          {preview ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
                onClick={() => {
                  resolver(preview, "rechazar")
                  setPreview(null)
                }}
              >
                <X className="size-4" />
                Rechazar
              </Button>
              <Button
                className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                onClick={() => {
                  resolver(preview, "aprobar")
                  setPreview(null)
                }}
              >
                <Check className="size-4" />
                Aprobar
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
