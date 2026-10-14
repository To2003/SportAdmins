"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { CONCEPTOS_DEUDA, formatARS } from "@/lib/data"
import { useDeudas } from "@/lib/deudas-store"
import { useTorneo } from "@/lib/torneo-store"

export function NuevaDeudaDialog() {
  const { crearDeuda } = useDeudas()
  const { equipos } = useTorneo()
  const [open, setOpen] = useState(false)
  const [tipoConcepto, setTipoConcepto] = useState<string>("")
  const [conceptoOtro, setConceptoOtro] = useState("")
  const [monto, setMonto] = useState("")
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  const todosSeleccionados = seleccionados.length === equipos.length

  function toggleEquipo(id: string) {
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleTodos() {
    setSeleccionados(todosSeleccionados ? [] : equipos.map((e) => e.id))
  }

  function limpiar() {
    setTipoConcepto("")
    setConceptoOtro("")
    setMonto("")
    setSeleccionados([])
  }

  function crear() {
    const concepto = tipoConcepto === "Otro" ? conceptoOtro.trim() : tipoConcepto
    const montoNum = Number(monto)

    if (!concepto || !montoNum || montoNum <= 0 || seleccionados.length === 0) {
      toast.error("Completá los datos", {
        description: "Elegí un concepto, un monto mayor a $0 y al menos un equipo.",
      })
      return
    }

    const cantidad = crearDeuda({ concepto, monto: montoNum, equipoIds: seleccionados })
    toast.success("Deuda creada", {
      description: `${concepto} · ${formatARS(montoNum)} para ${cantidad} equipo${cantidad > 1 ? "s" : ""}.`,
    })
    limpiar()
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        Nueva deuda
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) limpiar() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva deuda</DialogTitle>
            <DialogDescription>Creá un cargo y elegí a qué equipos se les asigna.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-2">
              <Label>Concepto</Label>
              <Select value={tipoConcepto} onValueChange={(v) => setTipoConcepto(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elegí un concepto" />
                </SelectTrigger>
                <SelectContent>
                  {CONCEPTOS_DEUDA.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tipoConcepto === "Otro" && (
              <div className="grid gap-2">
                <Label htmlFor="concepto-otro">Detalle del concepto</Label>
                <Input
                  id="concepto-otro"
                  value={conceptoOtro}
                  onChange={(e) => setConceptoOtro(e.target.value)}
                  placeholder="Ej: Compra de pelotas"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="monto-deuda">Monto (ARS)</Label>
              <Input
                id="monto-deuda"
                type="number"
                min={0}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej: 9000"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Equipos destinatarios</Label>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  Todos
                  <Switch checked={todosSeleccionados} onCheckedChange={toggleTodos} />
                </label>
              </div>
              <Card className="max-h-52 overflow-y-auto p-0">
                <ul className="divide-y divide-border">
                  {equipos.map((e) => (
                    <li key={e.id}>
                      <label className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm">
                        <span className="truncate text-foreground">{e.nombre}</span>
                        <Switch checked={seleccionados.includes(e.id)} onCheckedChange={() => toggleEquipo(e.id)} />
                      </label>
                    </li>
                  ))}
                </ul>
              </Card>
              <p className="text-xs text-muted-foreground">{seleccionados.length} equipo(s) seleccionado(s)</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={crear}>Crear deuda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
