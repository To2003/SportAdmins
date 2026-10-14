"use client"

import { useState } from "react"
import { Plus, Save, MapPin } from "lucide-react"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { FORMATOS, canchas, type ConfigTorneo, type FormatoTorneo } from "@/lib/data"
import { useTorneo } from "@/lib/torneo-store"

export function TorneoConfig() {
  const { config, setConfig } = useTorneo()
  const [form, setForm] = useState<ConfigTorneo>(config)
  const [nuevoOpen, setNuevoOpen] = useState(false)
  const [nuevo, setNuevo] = useState({ nombre: "", temporada: "", fechaInicio: "", formato: "liga-playoff" as FormatoTorneo })

  const set = <K extends keyof ConfigTorneo>(k: K, v: ConfigTorneo[K]) => setForm((f) => ({ ...f, [k]: v }))
  const num = (v: string) => (v === "" ? 0 : Number(v))

  function guardar() {
    if (!form.nombre.trim() || !form.temporada.trim()) {
      toast.error("El nombre y la temporada son obligatorios")
      return
    }
    setConfig(form)
    toast.success("Torneo actualizado", { description: `${form.nombre} · ${form.temporada}` })
  }

  function crear() {
    if (!nuevo.nombre.trim() || !nuevo.temporada.trim() || !nuevo.fechaInicio) {
      toast.error("Completá nombre, temporada y fecha de inicio")
      return
    }
    const c = { ...form, ...nuevo, inscripcionAbierta: true }
    setConfig(c)
    setForm(c)
    setNuevoOpen(false)
    toast.success("Torneo creado", {
      description: "La inscripción quedó abierta. Inscribí los equipos desde la sección Equipos.",
    })
  }

  return (
    <>
      <PageHeader title="Torneo" description="Creá el torneo y definí su formato, reglas de puntuación y sedes.">
        <Button size="sm" variant="outline" onClick={() => setNuevoOpen(true)}>
          <Plus className="size-4" />
          Nuevo torneo
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Datos generales</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="t-nombre">Nombre</Label>
              <Input id="t-nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="t-temp">Temporada</Label>
                <Input id="t-temp" value={form.temporada} onChange={(e) => set("temporada", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-inicio">Fecha de inicio</Label>
                <Input
                  id="t-inicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) => set("fechaInicio", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-org">Organizador</Label>
              <Input id="t-org" value={form.organizador} onChange={(e) => set("organizador", e.target.value)} />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <span className="text-sm">
                <span className="block font-medium text-foreground">Inscripción abierta</span>
                <span className="text-xs text-muted-foreground">Permite sumar equipos y delegados nuevos.</span>
              </span>
              <Switch checked={form.inscripcionAbierta} onCheckedChange={(v) => set("inscripcionAbierta", v)} />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Formato y reglamento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Formato</Label>
                <Select value={form.formato} onValueChange={(v) => set("formato", v as FormatoTorneo)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FORMATOS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-jornadas">Cantidad de jornadas</Label>
                <Input
                  id="t-jornadas"
                  type="number"
                  min={1}
                  value={form.cantidadJornadas}
                  onChange={(e) => set("cantidadJornadas", num(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="t-pv" className="text-xs">Pts victoria 3-0/3-1</Label>
                <Input id="t-pv" type="number" min={0} value={form.puntosVictoria} onChange={(e) => set("puntosVictoria", num(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-pva" className="text-xs">Pts victoria 3-2</Label>
                <Input id="t-pva" type="number" min={0} value={form.puntosVictoriaAjustada} onChange={(e) => set("puntosVictoriaAjustada", num(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-pda" className="text-xs">Pts derrota 2-3</Label>
                <Input id="t-pda" type="number" min={0} value={form.puntosDerrotaAjustada} onChange={(e) => set("puntosDerrotaAjustada", num(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="t-sets">Sets para ganar</Label>
                <Input id="t-sets" type="number" min={1} max={3} value={form.setsParaGanar} onChange={(e) => set("setsParaGanar", num(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-min">Partidos mín. para playoff</Label>
                <Input id="t-min" type="number" min={0} value={form.minimoPartidosPlayoff} onChange={(e) => set("minimoPartidosPlayoff", num(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Sedes y canchas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {canchas.map((c) => (
              <p key={c} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground">
                <MapPin className="size-4 text-primary" />
                {c}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={guardar}>
          <Save className="size-4" />
          Guardar configuración
        </Button>
      </div>

      <Dialog open={nuevoOpen} onOpenChange={setNuevoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo torneo</DialogTitle>
            <DialogDescription>Después vas a poder inscribir equipos y generar el fixture.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="n-nombre">Nombre</Label>
              <Input id="n-nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Ej: Torneo Santana" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="n-temp">Temporada</Label>
                <Input id="n-temp" value={nuevo.temporada} onChange={(e) => setNuevo({ ...nuevo, temporada: e.target.value })} placeholder="Clausura 2026" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="n-inicio">Inicio</Label>
                <Input id="n-inicio" type="date" value={nuevo.fechaInicio} onChange={(e) => setNuevo({ ...nuevo, fechaInicio: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Formato</Label>
              <Select value={nuevo.formato} onValueChange={(v) => setNuevo({ ...nuevo, formato: v as FormatoTorneo })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FORMATOS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNuevoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={crear}>Crear torneo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
