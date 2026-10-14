import { CalendarDays, CalendarRange, Trophy } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FixtureBoard } from "@/components/fixture/fixture-board"
import { JornadasPanel } from "@/components/fixture/jornadas-panel"
import { StandingsTable } from "@/components/fixture/standings-table"

export default function FixturePage() {
  return (
    <>
      <PageHeader
        title="Fixture"
        description="Armá los cruces, gestioná las jornadas, cargá resultados y seguí la tabla de posiciones."
      />
      <Tabs defaultValue="fixture" className="gap-5">
        <TabsList className="h-9 w-full max-w-lg">
          <TabsTrigger value="fixture">
            <CalendarDays className="size-4" />
            Fixture y resultados
          </TabsTrigger>
          <TabsTrigger value="jornadas">
            <CalendarRange className="size-4" />
            Jornadas
          </TabsTrigger>
          <TabsTrigger value="posiciones">
            <Trophy className="size-4" />
            Posiciones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fixture">
          <FixtureBoard />
        </TabsContent>
        <TabsContent value="jornadas">
          <JornadasPanel />
        </TabsContent>
        <TabsContent value="posiciones">
          <StandingsTable />
        </TabsContent>
      </Tabs>
    </>
  )
}
