"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, ArrowDown, ArrowUp, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SaldoBadge } from "@/components/status-badge"
import { formatARS, formatFecha } from "@/lib/data"
import { saldoEquipo, ultimoPagoEquipo, useDeudas } from "@/lib/deudas-store"
import { useTorneo } from "@/lib/torneo-store"

type Sort = "none" | "asc" | "desc"

function saldoClass(saldo: number) {
  if (saldo < 0) return "text-danger"
  if (saldo > 0) return "text-success"
  return "text-muted-foreground"
}

export function DelinquencyTable() {
  const { equipos: todos, equipoSesion } = useTorneo()
  const { deudas } = useDeudas()
  const [sort, setSort] = useState<Sort>("asc")
  const [soloDeuda, setSoloDeuda] = useState(false)

  // Saldo y último pago se calculan desde las deudas y pagos reales (1.4.4.4)
  const equipos = useMemo(
    () =>
      todos
        .filter((e) => !equipoSesion || e.id === equipoSesion)
        .map((e) => ({ ...e, saldo: saldoEquipo(deudas, e.id), ultimoPago: ultimoPagoEquipo(deudas, e.id) })),
    [todos, deudas, equipoSesion],
  )

  const ordenados = useMemo(() => {
    const visibles = soloDeuda ? equipos.filter((e) => e.saldo < 0) : equipos
    if (sort === "none") return visibles
    return [...visibles].sort((a, b) => (sort === "asc" ? a.saldo - b.saldo : b.saldo - a.saldo))
  }, [equipos, sort, soloDeuda])

  function toggleSort() {
    setSort((s) => (s === "asc" ? "desc" : s === "desc" ? "none" : "asc"))
  }

  const SortIcon = sort === "asc" ? ArrowUp : sort === "desc" ? ArrowDown : ArrowUpDown

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {equipos.filter((e) => e.saldo < 0).length} de {equipos.length} equipos con deuda
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Switch checked={soloDeuda} onCheckedChange={setSoloDeuda} aria-label="Mostrar solo equipos con deuda" />
            Solo con deuda
          </label>
          <button
            onClick={toggleSort}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <SortIcon className="size-3.5" />
            Ordenar por saldo
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <Card className="hidden p-0 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Equipo</TableHead>
              <TableHead>Capitán / Contacto</TableHead>
              <TableHead className="text-right">
                <button onClick={toggleSort} className="inline-flex items-center gap-1 hover:text-primary">
                  Saldo <SortIcon className="size-3.5" />
                </button>
              </TableHead>
              <TableHead className="pr-4">Último pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenados.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="pl-4">
                  <span className="font-medium text-foreground">{e.nombre}</span>
                </TableCell>
                <TableCell>
                  <p className="text-foreground">{e.capitan}</p>
                  <p className="text-xs text-muted-foreground">{e.telefono}</p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn("font-mono font-semibold", saldoClass(e.saldo))}>
                      {e.saldo === 0 ? formatARS(0) : formatARS(e.saldo)}
                    </span>
                    <SaldoBadge saldo={e.saldo} />
                  </div>
                </TableCell>
                <TableCell className="pr-4 text-muted-foreground">{e.ultimoPago ? formatFecha(e.ultimoPago) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {ordenados.map((e) => (
          <li key={e.id}>
            <Card>
              <div className="flex items-start justify-between gap-3 px-4">
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{e.nombre}</span>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="size-3" />
                    {e.capitan} · {e.telefono}
                  </p>
                </div>
                <SaldoBadge saldo={e.saldo} />
              </div>
              <div className="flex items-center justify-between gap-3 px-4">
                <div>
                  <span className={cn("font-mono text-lg font-bold", saldoClass(e.saldo))}>
                    {formatARS(e.saldo)}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Último pago: {e.ultimoPago ? formatFecha(e.ultimoPago) : "—"}
                  </p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
