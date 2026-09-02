"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { deudasIniciales, type Deuda } from "@/lib/data"

const COMPROBANTES_DEMO = [
  "/comprobantes/comprobante-1.png",
  "/comprobantes/comprobante-2.png",
  "/comprobantes/comprobante-3.png",
]

interface CrearDeudaInput {
  concepto: string
  monto: number
  equipoIds: string[]
}

interface DeudasContextValue {
  deudas: Deuda[]
  crearDeuda: (input: CrearDeudaInput) => number
  enviarComprobante: (deudaId: string) => void
  aprobarDeuda: (deudaId: string) => void
  rechazarDeuda: (deudaId: string) => void
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
      enviarComprobante(deudaId) {
        setDeudas((prev) =>
          prev.map((d) =>
            d.id === deudaId
              ? {
                  ...d,
                  estado: "en_revision",
                  comprobanteImagen: COMPROBANTES_DEMO[Math.floor(Math.random() * COMPROBANTES_DEMO.length)],
                  comprobanteSubidoEl: new Date().toISOString(),
                }
              : d,
          ),
        )
      },
      aprobarDeuda(deudaId) {
        setDeudas((prev) => prev.map((d) => (d.id === deudaId ? { ...d, estado: "aprobado" } : d)))
      },
      rechazarDeuda(deudaId) {
        setDeudas((prev) => prev.map((d) => (d.id === deudaId ? { ...d, estado: "rechazado" } : d)))
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
