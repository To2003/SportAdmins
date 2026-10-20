"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { deudasIniciales, type Deuda } from "@/lib/data"

interface CrearDeudaInput {
  concepto: string
  monto: number
  equipoIds: string[]
}

interface DeudasContextValue {
  deudas: Deuda[]
  crearDeuda: (input: CrearDeudaInput) => number
  aprobarDeuda: (deudaId: string) => void
  rechazarDeuda: (deudaId: string) => void
  /** Con imagen, el pago queda en revisión en el Buzón; sin imagen, se registra como efectivo aprobado. */
  registrarPagoManual: (deudaId: string, comprobanteImagen?: string) => void
}

const DeudasContext = createContext<DeudasContextValue | null>(null)

export function DeudasProvider({ children }: { children: ReactNode }) {
  const [deudas, setDeudas] = useState<Deuda[]>(deudasIniciales)

  const value = useMemo<DeudasContextValue>(
    () => ({
      deudas,
      crearDeuda({ concepto, monto, equipoIds }) {
        const ahora = new Date().toISOString()
        const nuevas: Deuda[] = equipoIds.map((equipoId, i) => ({
          id: `d-${Date.now()}-${i}`,
          equipoId,
          concepto,
          monto,
          creadoEl: ahora,
          estado: "pendiente",
        }))
        setDeudas((prev) => [...nuevas, ...prev])
        return nuevas.length
      },
      aprobarDeuda(deudaId) {
        const resueltoEl = new Date().toISOString()
        setDeudas((prev) => prev.map((d) => (d.id === deudaId ? { ...d, estado: "aprobado", resueltoEl } : d)))
      },
      rechazarDeuda(deudaId) {
        const resueltoEl = new Date().toISOString()
        setDeudas((prev) => prev.map((d) => (d.id === deudaId ? { ...d, estado: "rechazado", resueltoEl } : d)))
      },
      registrarPagoManual(deudaId, comprobanteImagen) {
        const ahora = new Date().toISOString()
        setDeudas((prev) =>
          prev.map((d) =>
            d.id !== deudaId
              ? d
              : comprobanteImagen
                ? { ...d, estado: "en_revision", medio: "transferencia", comprobanteImagen, comprobanteSubidoEl: ahora }
                : { ...d, estado: "aprobado", medio: "efectivo", resueltoEl: ahora },
          ),
        )
      },
    }),
    [deudas],
  )

  return <DeudasContext.Provider value={value}>{children}</DeudasContext.Provider>
}

export function useDeudas() {
  const ctx = useContext(DeudasContext)
  if (!ctx) throw new Error("useDeudas debe usarse dentro de <DeudasProvider>")
  return ctx
}

// ---- Derivados ----

/** Saldo de un equipo (1.4.4.3/1.4.4.4): todo cargo todavía no aprobado cuenta como deuda, en negativo. */
export function saldoEquipo(deudas: Deuda[], equipoId: string) {
  return -deudas
    .filter((d) => d.equipoId === equipoId && d.estado !== "aprobado")
    .reduce((acc, d) => acc + d.monto, 0)
}

/** Fecha del último pago aprobado del equipo, o undefined si nunca pagó. */
export function ultimoPagoEquipo(deudas: Deuda[], equipoId: string) {
  return deudas
    .filter((d) => d.equipoId === equipoId && d.estado === "aprobado" && d.resueltoEl)
    .map((d) => d.resueltoEl!)
    .sort()
    .at(-1)
}
