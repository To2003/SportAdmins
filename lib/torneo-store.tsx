"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  configFeesInicial,
  configTorneoInicial,
  equipos as equiposIniciales,
  jornadasIniciales,
  jugadores as jugadoresIniciales,
  partidos as partidosIniciales,
  permisosIniciales,
  sancionesIniciales,
  usuariosIniciales,
  type ConfigFees,
  type ConfigTorneo,
  type Equipo,
  type Jornada,
  type Jugador,
  type Partido,
  type Permiso,
  type Rol,
  type Sancion,
  type Usuario,
} from "@/lib/data"

const SESION_KEY = "sc-sesion"

interface TorneoContextValue {
  config: ConfigTorneo
  setConfig: (c: ConfigTorneo) => void
  fees: ConfigFees
  setFees: (f: ConfigFees) => void

  equipos: Equipo[]
  guardarEquipo: (e: Equipo) => void
  eliminarEquipo: (id: string) => void
  setRoster: (id: string, roster: Equipo["roster"]) => void
  setBloqueo: (id: string, bloqueado: boolean) => void

  jugadores: Jugador[]
  guardarJugador: (j: Jugador) => void
  eliminarJugador: (id: string) => void

  jornadas: Jornada[]
  jornadaActual: number
  guardarJornada: (j: Jornada) => void
  agregarJornada: () => void

  partidos: Partido[]
  setPartidos: React.Dispatch<React.SetStateAction<Partido[]>>

  sanciones: Sancion[]
  crearSancion: (s: Omit<Sancion, "id" | "creadaEl">) => void
  anularSancion: (id: string) => void

  usuarios: Usuario[]
  guardarUsuario: (u: Usuario) => void
  permisos: Record<Rol, Permiso[]>
  togglePermiso: (rol: Rol, permiso: Permiso) => void

  sesion: Usuario | null
  iniciarSesion: (u: Usuario) => void
  cerrarSesion: () => void
  puede: (permiso: Permiso) => boolean
}

const TorneoContext = createContext<TorneoContextValue | null>(null)

export function TorneoProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(configTorneoInicial)
  const [fees, setFees] = useState(configFeesInicial)
  const [equipos, setEquipos] = useState<Equipo[]>(equiposIniciales)
  const [jugadores, setJugadores] = useState<Jugador[]>(jugadoresIniciales)
  const [jornadas, setJornadas] = useState<Jornada[]>(jornadasIniciales)
  const [partidos, setPartidos] = useState<Partido[]>(partidosIniciales)
  const [sanciones, setSanciones] = useState<Sancion[]>(sancionesIniciales)
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales)
  const [permisos, setPermisos] = useState(permisosIniciales)
  const [sesion, setSesion] = useState<Usuario | null>(null)

  // La sesión sobrevive a un refresh del navegador (prototipo: sin backend)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESION_KEY)
      if (raw) setSesion(JSON.parse(raw))
    } catch {}
  }, [])

  const value = useMemo<TorneoContextValue>(() => {
    const jornadaActual =
      jornadas.find((j) => j.estado === "en-curso")?.numero ??
      jornadas.find((j) => j.estado === "programada")?.numero ??
      jornadas.length

    function upsert<T extends { id: string }>(list: T[], item: T) {
      return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]
    }

    return {
      config,
      setConfig,
      fees,
      setFees,

      equipos,
      guardarEquipo: (e) => setEquipos((prev) => upsert(prev, e)),
      eliminarEquipo: (id) => setEquipos((prev) => prev.filter((e) => e.id !== id)),
      setRoster: (id, roster) => setEquipos((prev) => prev.map((e) => (e.id === id ? { ...e, roster } : e))),
      setBloqueo: (id, bloqueado) => setEquipos((prev) => prev.map((e) => (e.id === id ? { ...e, bloqueado } : e))),

      jugadores,
      guardarJugador: (j) => setJugadores((prev) => upsert(prev, j)),
      eliminarJugador: (id) => setJugadores((prev) => prev.filter((j) => j.id !== id)),

      jornadas,
      jornadaActual,
      guardarJornada: (j) =>
        setJornadas((prev) => prev.map((x) => (x.numero === j.numero ? j : x)).sort((a, b) => a.numero - b.numero)),
      agregarJornada: () =>
        setJornadas((prev) => {
          const ultima = prev[prev.length - 1]
          const fecha = new Date(ultima ? ultima.fecha : config.fechaInicio)
          if (ultima) fecha.setDate(fecha.getDate() + 7)
          return [
            ...prev,
            {
              numero: (ultima?.numero ?? 0) + 1,
              fecha: fecha.toISOString().slice(0, 10),
              estado: "programada",
              fee: fees.cuotaPorFecha,
            },
          ]
        }),

      partidos,
      setPartidos,

      sanciones,
      crearSancion: (s) =>
        setSanciones((prev) => [{ ...s, id: `s-${Date.now()}`, creadaEl: new Date().toISOString() }, ...prev]),
      anularSancion: (id) => setSanciones((prev) => prev.map((s) => (s.id === id ? { ...s, anulada: true } : s))),

      usuarios,
      guardarUsuario: (u) => setUsuarios((prev) => upsert(prev, u)),
      permisos,
      togglePermiso: (rol, permiso) =>
        setPermisos((prev) => ({
          ...prev,
          [rol]: prev[rol].includes(permiso) ? prev[rol].filter((p) => p !== permiso) : [...prev[rol], permiso],
        })),

      sesion,
      iniciarSesion: (u) => {
        setSesion(u)
        try {
          sessionStorage.setItem(SESION_KEY, JSON.stringify(u))
        } catch {}
      },
      cerrarSesion: () => {
        setSesion(null)
        try {
          sessionStorage.removeItem(SESION_KEY)
        } catch {}
      },
      // Sin sesión (ej: entrando directo por URL a la demo) se muestra todo como administrador
      puede: (permiso) => permisos[sesion?.rol ?? "admin"].includes(permiso),
    }
  }, [config, fees, equipos, jugadores, jornadas, partidos, sanciones, usuarios, permisos, sesion])

  return <TorneoContext.Provider value={value}>{children}</TorneoContext.Provider>
}

export function useTorneo() {
  const ctx = useContext(TorneoContext)
  if (!ctx) throw new Error("useTorneo debe usarse dentro de <TorneoProvider>")
  return ctx
}

// ---- Derivados ----

/** Una suspensión está vigente mientras no se hayan cumplido todas sus fechas. */
export function fechasCumplidas(s: Sancion, jornadaActual: number) {
  if (s.tipo !== "suspension") return 0
  // La jornada de inicio es la primera que el jugador no puede jugar.
  return Math.min(s.fechas, Math.max(0, jornadaActual - s.jornadaInicio))
}

export function sancionVigente(s: Sancion, jornadaActual: number) {
  if (s.anulada) return false
  if (s.tipo === "suspension") return fechasCumplidas(s, jornadaActual) < s.fechas
  if (s.tipo === "amonestacion") return s.jornadaInicio >= jornadaActual - 1
  return false
}

export interface FilaPosicion {
  equipo: Equipo
  pj: number
  pg: number
  pp: number
  sf: number
  sc: number
  pts: number
}

export function calcularPosiciones(equipos: Equipo[], partidos: Partido[], config: ConfigTorneo): FilaPosicion[] {
  const filas = new Map<string, FilaPosicion>(
    equipos.map((e) => [e.nombre, { equipo: e, pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, pts: 0 }]),
  )
  for (const p of partidos) {
    if (p.setsA === null || p.setsB === null) continue
    const a = filas.get(p.equipoA)
    const b = filas.get(p.equipoB)
    for (const [fila, propios, rival] of [
      [a, p.setsA, p.setsB],
      [b, p.setsB, p.setsA],
    ] as const) {
      if (!fila) continue
      fila.pj++
      fila.sf += propios
      fila.sc += rival
      const ajustado = Math.abs(propios - rival) === 1
      if (propios > rival) {
        fila.pg++
        fila.pts += ajustado ? config.puntosVictoriaAjustada : config.puntosVictoria
      } else {
        fila.pp++
        fila.pts += ajustado ? config.puntosDerrotaAjustada : 0
      }
    }
  }
  return [...filas.values()].sort(
    (x, y) => y.pts - x.pts || y.pg - x.pg || y.sf - y.sc - (x.sf - x.sc) || x.equipo.nombre.localeCompare(y.equipo.nombre),
  )
}
