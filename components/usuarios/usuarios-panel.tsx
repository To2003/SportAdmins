"use client"

import { useState } from "react"
import { UserPlus, ShieldCheck, Users, KeyRound, Mail, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { PageHeader } from "@/components/page-header"
import { PERMISOS, ROLES, type Rol, type Usuario } from "@/lib/data"
import { useTorneo } from "@/lib/torneo-store"

function EstadoUsuario({ u }: { u: Usuario }) {
  if (u.invitacionPendiente) return <StatusBadge tone="warning">Invitación pendiente</StatusBadge>
  if (!u.activo) return <StatusBadge tone="neutral">Inactivo</StatusBadge>
  return <StatusBadge tone="success">Activo</StatusBadge>
}

export function UsuariosPanel() {
  const { usuarios, equipos, permisos, guardarUsuario, togglePermiso } = useTorneo()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: "", email: "", rol: "admin" as Rol, equipoId: "" })

  const staff = usuarios.filter((u) => u.rol !== "delegado")
  const delegados = usuarios.filter((u) => u.rol === "delegado")
  const nombreEquipo = (id?: string) => equipos.find((e) => e.id === id)?.nombre ?? "—"

  function invitar() {
    if (!form.nombre.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Completá nombre y un email válido")
      return
    }
    if (form.rol === "delegado" && !form.equipoId) {
      toast.error("Elegí el equipo del delegado")
      return
    }
    guardarUsuario({
      id: `u-${Date.now()}`,
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      rol: form.rol,
      equipoId: form.rol === "delegado" ? form.equipoId : undefined,
      activo: false,
      invitacionPendiente: true,
    })
    toast.success("Invitación enviada", { description: `${form.email} · ${ROLES[form.rol]}` })
    setForm({ nombre: "", email: "", rol: "admin", equipoId: "" })
    setOpen(false)
  }

  const fila = (u: Usuario, conEquipo: boolean) => (
    <TableRow key={u.id}>
      <TableCell className="pl-4">
        <p className="font-medium text-foreground">{u.nombre}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="size-3" />
          {u.email}
        </p>
      </TableCell>
      <TableCell className="text-muted-foreground">{conEquipo ? nombreEquipo(u.equipoId) : ROLES[u.rol]}</TableCell>
      <TableCell>
        <EstadoUsuario u={u} />
      </TableCell>
      <TableCell className="pr-4 text-right">
        {u.invitacionPendiente ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Invitación reenviada", { description: u.email })}
          >
            <Send className="size-3.5" />
            Reenviar
          </Button>
        ) : (
          <Switch
            checked={u.activo}
            onCheckedChange={(v) => {
              guardarUsuario({ ...u, activo: v })
              toast.success(v ? "Usuario habilitado" : "Usuario deshabilitado", { description: u.nombre })
            }}
            aria-label={`Habilitar a ${u.nombre}`}
          />
        )}
      </TableCell>
    </TableRow>
  )

  const tabla = (lista: Usuario[], conEquipo: boolean) => (
    <Card className="overflow-x-auto p-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Usuario</TableHead>
            <TableHead>{conEquipo ? "Equipo" : "Rol"}</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="pr-4 text-right">Acceso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{lista.map((u) => fila(u, conEquipo))}</TableBody>
      </Table>
    </Card>
  )

  const grupos = [...new Set(PERMISOS.map((p) => p.grupo))]
  const roles = Object.keys(ROLES) as Rol[]

  return (
    <>
      <PageHeader title="Usuarios" description="Administradores, delegados de equipo y permisos de cada rol.">
        <Button size="sm" onClick={() => setOpen(true)}>
          <UserPlus className="size-4" />
          Invitar usuario
        </Button>
      </PageHeader>

      <Tabs defaultValue="admins" className="gap-5">
        <TabsList className="h-9 w-full max-w-lg">
          <TabsTrigger value="admins">
            <ShieldCheck className="size-4" />
            Administradores
          </TabsTrigger>
          <TabsTrigger value="delegados">
            <Users className="size-4" />
            Delegados
          </TabsTrigger>
          <TabsTrigger value="permisos">
            <KeyRound className="size-4" />
            Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins">{tabla(staff, false)}</TabsContent>

        <TabsContent value="delegados">
          <p className="mb-3 text-sm text-muted-foreground">
            Cada equipo tiene un delegado responsable de cargar el plantel y subir los comprobantes desde la app del
            capitán.
          </p>
          {tabla(delegados, true)}
        </TabsContent>

        <TabsContent value="permisos">
          <Card className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Permiso</TableHead>
                  {roles.map((r) => (
                    <TableHead key={r} className="text-center last:pr-4">
                      {ROLES[r]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupos.flatMap((g) => [
                  <TableRow key={g} className="bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={roles.length + 1} className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {g}
                    </TableCell>
                  </TableRow>,
                  ...PERMISOS.filter((p) => p.grupo === g).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-4 text-foreground">{p.label}</TableCell>
                      {roles.map((r) => {
                        // El admin no puede quitarse a sí mismo la gestión de usuarios
                        const bloqueado = r === "admin" && p.id === "usuarios.gestionar"
                        return (
                          <TableCell key={r} className="text-center last:pr-4">
                            <Switch
                              checked={permisos[r].includes(p.id)}
                              disabled={bloqueado}
                              onCheckedChange={() => togglePermiso(r, p.id)}
                              aria-label={`${p.label} para ${ROLES[r]}`}
                            />
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )),
                ])}
              </TableBody>
            </Table>
          </Card>
          <p className="mt-3 text-xs text-muted-foreground">
            Los cambios se aplican al instante: el menú lateral solo muestra las secciones permitidas para el rol.
          </p>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar usuario</DialogTitle>
            <DialogDescription>Le llega un email para crear su contraseña y acceder.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="inv-nombre">Nombre y apellido</Label>
              <Input id="inv-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inv-email">Email</Label>
              <Input id="inv-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Rol</Label>
              <Select value={form.rol} onValueChange={(v) => setForm({ ...form, rol: v as Rol })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLES[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.rol === "delegado" && (
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={invitar}>Enviar invitación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
