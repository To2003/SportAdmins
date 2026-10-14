"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, ArrowDown, ArrowUp, Lock, Phone } from "lucide-react"
import { toast } from "sonner"
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
import { SaldoBadge, StatusBadge } from "@/components/status-badge"
import { formatARS, formatFecha } from "@/lib/data"
import { useTorneo } from "@/lib/torneo-store"

type Sort = "none" | "asc" | "desc"

function saldoClass(saldo: number) {
  if (saldo < 0) return "text-danger"
  if (saldo > 0) return "text-success"
  return "text-muted-foreground"
}

export function DelinquencyTable() {
  const { equipos, setBloqueo } = useTorneo()
  const [sort, setSort] = useState<Sort>("asc")

  const ordenados = useMemo(() => {
    if (sort === "none") return equipos
    return [...equipos].sort((a, b) => (sort === "asc" ? a.saldo - b.saldo : b.saldo - a.saldo))
  }, [equipos, sort])

  function toggleSort() {
    setSort((s) => (s === "asc" ? "desc" : s === "desc" ? "none" : "asc"))
  }

  function toggleBloqueo(id: string, value: boolean) {
    setBloqueo(id, value)
    const eq = equipos.find((e) => e.id === id)
    if (eq) {
      value
        ? toast.warning("Participación bloqueada", { description: eq.nombre })
        : toast.success("Participación habilitada", { description: eq.nombre })
    }
  }

  const SortIcon = sort === "asc" ? ArrowUp : sort === "desc" ? ArrowDown : ArrowUpDown

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {equipos.filter((e) => e.saldo < 0).length} de {equipos.length} equipos con deuda
        </p>
        <button
          onClick={toggleSort}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <SortIcon className="size-3.5" />
          Ordenar por saldo
        </button>
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
              <TableHead>Último pago</TableHead>
              <TableHead className="pr-4 text-right">Participación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenados.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{e.nombre}</span>
                    {e.bloqueado ? (
                      <StatusBadge tone="danger" icon={<Lock className="size-3" />}>
                        Bloqueado
                      </StatusBadge>
                    ) : null}
                  </div>
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
                <TableCell className="text-muted-foreground">{formatFecha(e.ultimoPago)}</TableCell>
                <TableCell className="pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-muted-foreground">{e.bloqueado ? "Bloqueado" : "Habilitado"}</span>
                    <Switch
                      checked={e.bloqueado}
                      onCheckedChange={(v) => toggleBloqueo(e.id, v)}
                      aria-label={`Bloquear participación de ${e.nombre}`}
                    />
                  </div>
                </TableCell>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{e.nombre}</span>
                    {e.bloqueado ? (
                      <StatusBadge tone="danger" icon={<Lock className="size-3" />}>
                        Bloqueado
                      </StatusBadge>
                    ) : null}
                  </div>
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
                  <p className="text-xs text-muted-foreground">Último pago: {formatFecha(e.ultimoPago)}</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  Bloquear
                  <Switch
                    checked={e.bloqueado}
                    onCheckedChange={(v) => toggleBloqueo(e.id, v)}
                    aria-label={`Bloquear participación de ${e.nombre}`}
                  />
                </label>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
