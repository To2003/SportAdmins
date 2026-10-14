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
import { cn } from "@/lib/utils"
import { calcularPosiciones, useTorneo } from "@/lib/torneo-store"

export function StandingsTable() {
  const { equipos, partidos, config } = useTorneo()
  const filas = useMemo(() => calcularPosiciones(equipos, partidos, config), [equipos, partidos, config])
  // Clasifican al playoff los 8 primeros (si el formato lo incluye)
  const cortePlayoff = config.formato === "liga" ? 0 : 8

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        Victoria 3-0/3-1: {config.puntosVictoria} pts · Victoria 3-2: {config.puntosVictoriaAjustada} pts · Derrota
        2-3: {config.puntosDerrotaAjustada} pt · Se actualiza al cargar resultados.
      </p>
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-4">#</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead className="text-right">PJ</TableHead>
              <TableHead className="text-right">PG</TableHead>
              <TableHead className="text-right">PP</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Sets</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Dif</TableHead>
              <TableHead className="pr-4 text-right">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((f, i) => (
              <TableRow key={f.equipo.id} className={cn(i === cortePlayoff - 1 && "border-b-2 border-b-primary/40")}>
                <TableCell className="pl-4 font-mono text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{f.equipo.nombre}</TableCell>
                <TableCell className="text-right font-mono">{f.pj}</TableCell>
                <TableCell className="text-right font-mono">{f.pg}</TableCell>
                <TableCell className="text-right font-mono">{f.pp}</TableCell>
                <TableCell className="hidden text-right font-mono text-muted-foreground sm:table-cell">
                  {f.sf}-{f.sc}
                </TableCell>
                <TableCell className="hidden text-right font-mono text-muted-foreground sm:table-cell">
                  {f.sf - f.sc > 0 ? "+" : ""}
                  {f.sf - f.sc}
                </TableCell>
                <TableCell className="pr-4 text-right font-display text-base font-bold text-foreground">
                  {f.pts}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {cortePlayoff > 0 && (
        <p className="text-xs text-muted-foreground">La línea marca el corte de clasificación al playoff (top {cortePlayoff}).</p>
      )}
    </div>
  )
}
