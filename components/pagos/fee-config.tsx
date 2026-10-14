"use client"

import { useState } from "react"
import { Save, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/status-badge"
import { formatARS, formatFecha } from "@/lib/data"
import { useDeudas } from "@/lib/deudas-store"
import { useTorneo } from "@/lib/torneo-store"

export function FeeConfig() {
  const { fees, setFees, jornadas, guardarJornada, equipos } = useTorneo()
  const { deudas, crearDeuda } = useDeudas()
  const [form, setForm] = useState(fees)

  function guardar() {
    setFees(form)
    toast.success("Configuración guardada", {
      description: `Cuota por fecha ${formatARS(form.cuotaPorFecha)} · vence a los ${form.vencimientoDias} días.`,
    })
  }

  // Una jornada ya fue cobrada si existe alguna deuda con su concepto
  const conceptoDe = (n: number) => `Fecha ${n} — Cuota de partido`
  const yaGenerada = (n: number) => deudas.some((d) => d.concepto === conceptoDe(n))

  function generarCuotas(numero: number, monto: number) {
    const habilitados = equipos.filter((e) => !e.bloqueado).map((e) => e.id)
    const n = crearDeuda({ concepto: conceptoDe(numero), monto, equipoIds: habilitados })
    toast.success("Cuotas generadas", {
      description: `${conceptoDe(numero)} · ${formatARS(monto)} para ${n} equipos habilitados.`,
    })
  }

  const num = (v: string) => (v === "" ? 0 : Number(v))

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Valores del torneo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="fee-insc">Inscripción</Label>
              <Input
                id="fee-insc"
                type="number"
                min={0}
                value={form.inscripcion}
                onChange={(e) => setForm({ ...form, inscripcion: num(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fee-fecha">Cuota por fecha</Label>
              <Input
                id="fee-fecha"
                type="number"
                min={0}
                value={form.cuotaPorFecha}
                onChange={(e) => setForm({ ...form, cuotaPorFecha: num(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fee-venc">Días para pagar antes de quedar moroso</Label>
            <Input
              id="fee-venc"
              type="number"
              min={0}
              value={form.vencimientoDias}
              onChange={(e) => setForm({ ...form, vencimientoDias: num(e.target.value) })}
            />
          </div>
          <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span className="text-sm">
              <span className="block font-medium text-foreground">Bloqueo automático</span>
              <span className="text-xs text-muted-foreground">Bloquear al equipo si su deuda supera el tope.</span>
            </span>
            <Switch
              checked={form.bloqueoAutomatico}
              onCheckedChange={(v) => setForm({ ...form, bloqueoAutomatico: v })}
            />
          </label>
          {form.bloqueoAutomatico && (
            <div className="grid gap-2">
              <Label htmlFor="fee-tope">Tope de deuda</Label>
              <Input
                id="fee-tope"
                type="number"
                min={0}
                value={form.topeDeuda}
                onChange={(e) => setForm({ ...form, topeDeuda: num(e.target.value) })}
              />
            </div>
          )}
          <Button onClick={guardar} className="self-start">
            <Save className="size-4" />
            Guardar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fee por fecha</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {jornadas.map((j) => {
            const generada = yaGenerada(j.numero)
            return (
              <div key={j.numero} className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-24 flex-1">
                  <p className="text-sm font-medium text-foreground">Jornada {j.numero}</p>
                  <p className="text-xs text-muted-foreground">{formatFecha(j.fecha)}</p>
                </div>
                <Input
                  type="number"
                  min={0}
                  value={j.fee}
                  disabled={generada}
                  onChange={(e) => guardarJornada({ ...j, fee: num(e.target.value) })}
                  className="w-28 font-mono"
                  aria-label={`Fee de la jornada ${j.numero}`}
                />
                {generada ? (
                  <StatusBadge tone="success" className="w-32 justify-center">
                    Cuotas generadas
                  </StatusBadge>
                ) : (
                  <Button size="sm" variant="outline" className="w-32" onClick={() => generarCuotas(j.numero, j.fee)}>
                    <Send className="size-3.5" />
                    Generar cuotas
                  </Button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
