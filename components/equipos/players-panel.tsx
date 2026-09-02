"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlayoffBadge } from "@/components/status-badge"
import { jugadores, equipos, partidosJugadosPorJugador, PARTIDOS_MINIMOS_PLAYOFF } from "@/lib/data"

export function PlayersPanel() {
  const filas = useMemo(
    () =>
      jugadores
        .map((j) => ({
          ...j,
          equipoNombre: equipos.find((e) => e.id === j.equipoId)?.nombre ?? "—",
          jugados: partidosJugadosPorJugador(j.id),
        }))
        .sort((a, b) => b.jugados - a.jugados),
    [],
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        Para jugar el playoff, cada jugador necesita haber disputado al menos {PARTIDOS_MINIMOS_PLAYOFF} partidos
        en la fase de grupos.
      </p>

      {/* Desktop table */}
      <Card className="hidden p-0 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Jugador</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead className="text-right">Partidos jugados</TableHead>
              <TableHead className="pr-4 text-right">Playoff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                      {j.numero}
                    </span>
                    <span className="font-medium text-foreground">{j.nombre}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{j.equipoNombre}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-foreground">
                  {j.jugados}/{PARTIDOS_MINIMOS_PLAYOFF}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <PlayoffBadge jugados={j.jugados} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {filas.map((j) => (
          <li key={j.id}>
            <Card>
              <div className="flex items-center justify-between gap-3 px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                    {j.numero}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{j.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">{j.equipoNombre}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {j.jugados}/{PARTIDOS_MINIMOS_PLAYOFF}
                  </span>
                  <PlayoffBadge jugados={j.jugados} />
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
