"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Volleyball, ShieldCheck, Wallet, Users, LogIn } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { equipoCapitan, ROLES, type Usuario } from "@/lib/data"
import { useTorneo } from "@/lib/torneo-store"

// Código que el organizador comparte con los delegados para que se registren
const CODIGO_INVITACION = "SANTANA26"

export function LoginForm() {
  const router = useRouter()
  const { usuarios, iniciarSesion, guardarUsuario, config } = useTorneo()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [reg, setReg] = useState({ nombre: "", email: "", password: "", codigo: "" })

  function entrar(u: Usuario) {
    iniciarSesion(u)
    toast.success(`Hola, ${u.nombre.split(" ")[0]}`, { description: ROLES[u.rol] })
    router.push(u.rol === "delegado" ? "/capitan" : "/dashboard")
  }

  function ingresar(e: React.FormEvent) {
    e.preventDefault()
    const u = usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!u || password.length < 4) {
      toast.error("Email o contraseña incorrectos")
      return
    }
    if (!u.activo) {
      toast.error("Tu usuario todavía no está activo", { description: "Aceptá la invitación que te llegó por email." })
      return
    }
    entrar(u)
  }

  function registrar(e: React.FormEvent) {
    e.preventDefault()
    if (!reg.nombre.trim() || !/^\S+@\S+\.\S+$/.test(reg.email) || reg.password.length < 6) {
      toast.error("Revisá los datos", { description: "Nombre, email válido y contraseña de al menos 6 caracteres." })
      return
    }
    if (usuarios.some((u) => u.email.toLowerCase() === reg.email.toLowerCase())) {
      toast.error("Ya existe una cuenta con ese email")
      return
    }
    if (reg.codigo && reg.codigo.toUpperCase() !== CODIGO_INVITACION) {
      toast.error("Código de invitación inválido")
      return
    }
    // Con código de invitación se registra como delegado; sin código, como organizador de un torneo nuevo
    const u: Usuario = {
      id: `u-${Date.now()}`,
      nombre: reg.nombre.trim(),
      email: reg.email.trim(),
      rol: reg.codigo ? "delegado" : "admin",
      equipoId: reg.codigo ? equipoCapitan.id : undefined,
      activo: true,
    }
    guardarUsuario(u)
    entrar(u)
  }

  const demo: { label: string; icon: typeof ShieldCheck; user?: Usuario }[] = [
    { label: "Administrador", icon: ShieldCheck, user: usuarios.find((u) => u.rol === "admin") },
    { label: "Tesorero", icon: Wallet, user: usuarios.find((u) => u.rol === "tesorero") },
    { label: "Delegado", icon: Users, user: usuarios.find((u) => u.rol === "delegado" && u.equipoId === equipoCapitan.id) },
  ]

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Volleyball className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">SaqueCentral</h1>
            <p className="text-sm text-muted-foreground">{config.nombre}</p>
          </div>
        </div>

        <Card>
          <CardContent>
            <Tabs defaultValue="ingresar" className="gap-5">
              <TabsList className="h-9 w-full">
                <TabsTrigger value="ingresar">Ingresar</TabsTrigger>
                <TabsTrigger value="registro">Crear cuenta</TabsTrigger>
              </TabsList>

              <TabsContent value="ingresar">
                <form onSubmit={ingresar} className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="login-pass">Contraseña</Label>
                    <Input id="login-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit">
                    <LogIn className="size-4" />
                    Ingresar
                  </Button>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toast.info("Te enviamos un link para restablecer la contraseña", { description: email || undefined })}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="registro">
                <form onSubmit={registrar} className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reg-nombre">Nombre y apellido</Label>
                    <Input id="reg-nombre" value={reg.nombre} onChange={(e) => setReg({ ...reg, nombre: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-pass">Contraseña</Label>
                    <Input id="reg-pass" type="password" autoComplete="new-password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-codigo">Código de invitación (delegados)</Label>
                    <Input id="reg-codigo" value={reg.codigo} onChange={(e) => setReg({ ...reg, codigo: e.target.value })} placeholder={`Ej: ${CODIGO_INVITACION}`} />
                    <p className="text-xs text-muted-foreground">
                      Dejalo vacío si sos organizador y querés crear tu propio torneo.
                    </p>
                  </div>
                  <Button type="submit">Crear cuenta</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <p className="text-center text-xs font-medium text-muted-foreground">Acceso rápido para la demo</p>
          <div className="grid grid-cols-3 gap-2">
            {demo.map(({ label, icon: Icon, user }) => (
              <Button key={label} variant="outline" className="h-auto flex-col gap-1 py-2.5" disabled={!user} onClick={() => user && entrar(user)}>
                <Icon className="size-4 text-primary" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
