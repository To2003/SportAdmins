"use client"

import { useMemo, useState } from "react"
import { Banknote, Receipt, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { PagoBadge } from "@/components/status-badge"
import { formatARS, formatFechaHora, type Deuda } from "@/lib/data"
import { useDeudas } from "@/lib/deudas-store"
import { useTorneo } from "@/lib/torneo-store"

export function PaymentHistory() {
  const { deudas, registrarPagoManual } = useDeudas()
  const { equipos } = useTorneo()
  const [equipoFilter, setEquipoFilter] = useState("todos")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [preview, setPreview] = useState<Deuda | null>(null)

  const [registrarOpen, setRegistrarOpen] = useState(false)
  const [regEquipo, setRegEquipo] = useState("")
  const [regDeuda, setRegDeuda] = useState("")

  const nombreEquipo = (id: string) => equipos.find((e) => e.id === id)?.nombre ?? "—"

  const resueltas = useMemo(
    () =>
      deudas
        .filter((d) => d.estado === "aprobado" || d.estado === "rechazado")
        .filter((d) => equipoFilter === "todos" || d.equipoId === equipoFilter)
        .filter((d) => estadoFilter === "todos" || d.estado === estadoFilter)
        .sort((a, b) => (b.resueltoEl ?? b.creadoEl).localeCompare(a.resueltoEl ?? a.creadoEl)),
    [deudas, equipoFilter, estadoFilter],
  )

  const cobrado = resueltas.filter((d) => d.estado === "aprobado").reduce((a, d) => a + d.monto, 0)
  const impagas = deudas.filter((d) => d.equipoId === regEquipo && (d.estado === "pendiente" || d.estado === "rechazado"))

  function registrar() {
    const d = deudas.find((x) => x.id === regDeuda)
    if (!d) {
      toast.error("Elegí la deuda que se está pagando")
      return
    }
    registrarPagoManual(d.id)
    toast.success("Pago registrado", { description: `${nombreEquipo(d.equipoId)} · ${d.concepto} · ${formatARS(d.monto)}` })
    setRegistrarOpen(false)
    setRegEquipo("")
    setRegDeuda("")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-success/12 text-success">
            <Wallet className="size-5" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold leading-none text-foreground">{formatARS(cobrado)}</p>
            <p className="text-xs text-muted-foreground">cobrado con este filtro</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={equipoFilter} onValueChange={(v) => setEquipoFilter(v as string)}>
            <SelectTrigger className="w-full sm:w-48">
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
          <Select value={estadoFilter} onValueChange={(v) => setEstadoFilter(v as string)}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aprobado">Aprobados</SelectItem>
              <SelectItem value="rechazado">Rechazados</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setRegistrarOpen(true)}>
            <Banknote className="size-4" />
            Registrar pago en efectivo
          </Button>
        </div>
      </div>

      {resueltas.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">Sin pagos registrados con este filtro.</Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {resueltas.map((d) => (
              <li key={d.id} className="flex items-center gap-3 p-3 sm:p-4">
                {d.comprobanteImagen ? (
                  <button
                    type="button"
                    onClick={() => setPreview(d)}
                    className="size-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
                    aria-label="Ver comprobante"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.comprobanteImagen} alt="" className="size-full object-cover" />
                  </button>
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                    <Banknote className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{nombreEquipo(d.equipoId)}</p>
                  <p className="truncate text-sm text-muted-foreground">{d.concepto}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.medio === "efectivo" ? "Efectivo" : "Transferencia"} ·{" "}
                    {d.resueltoEl ? formatFechaHora(d.resueltoEl) : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-mono text-sm font-semibold text-foreground">{formatARS(d.monto)}</span>
                  <PagoBadge estado={d.estado} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Dialog open={preview !== null} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{preview ? nombreEquipo(preview.equipoId) : ""}</DialogTitle>
            <DialogDescription>
              {preview?.concepto} · {preview ? formatARS(preview.monto) : ""}
            </DialogDescription>
          </DialogHeader>
          {preview?.comprobanteImagen && (
            <div className="overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.comprobanteImagen} alt="Comprobante" className="max-h-[70vh] w-full object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={registrarOpen} onOpenChange={setRegistrarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar pago en efectivo</DialogTitle>
            <DialogDescription>Para pagos recibidos en mano en la cancha, sin comprobante digital.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-2">
              <Label>Equipo</Label>
              <Select
                value={regEquipo}
                onValueChange={(v) => {
                  setRegEquipo(v as string)
                  setRegDeuda("")
                }}
              >
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
            {regEquipo && (
              <div className="grid gap-2">
                <Label>Deuda que se cancela</Label>
                {impagas.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Receipt className="size-4" />
                    Este equipo no tiene deudas impagas.
                  </p>
                ) : (
                  <Select value={regDeuda} onValueChange={(v) => setRegDeuda(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elegí la deuda" />
                    </SelectTrigger>
                    <SelectContent>
                      {impagas.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.concepto} · {formatARS(d.monto)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegistrarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={registrar}>Registrar pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
