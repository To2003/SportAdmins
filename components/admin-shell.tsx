"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  CalendarDays,
  Users,
  Landmark,
  Megaphone,
  ShieldAlert,
  Volleyball,
  Menu,
  X,
  ExternalLink,
  Trophy,
  UserCog,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ROLES, type Permiso } from "@/lib/data"
import { useDeudas } from "@/lib/deudas-store"
import { useTorneo } from "@/lib/torneo-store"

const nav: { href: string; label: string; icon: typeof LayoutDashboard; permiso?: Permiso }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/torneo", label: "Torneo", icon: Trophy, permiso: "torneo.configurar" },
  { href: "/equipos", label: "Equipos", icon: Users, permiso: "equipos.gestionar" },
  { href: "/fixture", label: "Fixture", icon: CalendarDays, permiso: "fixture.gestionar" },
  { href: "/pagos", label: "Pagos", icon: Receipt, permiso: "pagos.validar" },
  { href: "/sanciones", label: "Sanciones", icon: ShieldAlert, permiso: "sanciones.gestionar" },
  { href: "/usuarios", label: "Usuarios", icon: UserCog, permiso: "usuarios.gestionar" },
  { href: "/tesoreria", label: "Tesorería", icon: Landmark, permiso: "pagos.validar" },
  { href: "/avisos", label: "Avisos", icon: Megaphone, permiso: "equipos.gestionar" },
]

function Brand() {
  const { config } = useTorneo()
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Volleyball className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-sm font-bold tracking-tight text-sidebar-foreground">SaqueCentral</p>
        <p className="text-[11px] text-muted-foreground">{config.temporada}</p>
      </div>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { deudas } = useDeudas()
  const { puede } = useTorneo()
  const pendientes = deudas.filter((d) => d.estado === "en_revision").length
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.filter((item) => !item.permiso || puede(item.permiso)).map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/")
        const Icon = item.icon
        const badge = item.href === "/pagos" ? pendientes : 0
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
            <span className="flex-1">{item.label}</span>
            {badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter()
  const { sesion, cerrarSesion } = useTorneo()
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Brand />
      <NavLinks onNavigate={onNavigate} />
      <Link
        href="/capitan"
        onClick={onNavigate}
        className="flex items-center justify-between gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
      >
        <span className="flex items-center gap-2">
          <ExternalLink className="size-4 text-primary" />
          App del capitán
        </span>
      </Link>
      <div className="flex items-center gap-2.5 border-t border-sidebar-border pt-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-primary">
          {(sesion?.nombre ?? "Demo").split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{sesion?.nombre ?? "Modo demo"}</p>
          <p className="truncate text-[11px] text-muted-foreground">{ROLES[sesion?.rol ?? "admin"]}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cerrar sesión"
          onClick={() => {
            cerrarSesion()
            router.push("/login")
          }}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { sesion } = useTorneo()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Los delegados solo tienen acceso a la app del capitán
  useEffect(() => {
    if (sesion?.rol === "delegado") router.replace("/capitan")
  }, [sesion, router])

  return (
    <div className="min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarInner />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <Menu className="size-5" />
        </Button>
        <Brand />
        <ThemeToggle />
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-sidebar-border bg-sidebar shadow-xl">
            <div className="flex items-center justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Cerrar menú">
                <X className="size-5" />
              </Button>
            </div>
            <SidebarInner onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  )
}
