import { Users, ListChecks } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RosterManager } from "@/components/equipos/roster-manager"
import { PlayersPanel } from "@/components/equipos/players-panel"

export default function EquiposPage() {
  return (
    <>
      <PageHeader
        title="Equipos"
        description="Revisá y aprobá las listas de buena fe, y controlá los partidos jugados por jugador."
      />
      <Tabs defaultValue="rosters" className="gap-5">
        <TabsList className="h-9 w-full max-w-md">
          <TabsTrigger value="rosters">
            <ListChecks className="size-4" />
            Listas de buena fe
          </TabsTrigger>
          <TabsTrigger value="jugadores">
            <Users className="size-4" />
            Jugadores
          </TabsTrigger>
        </TabsList>
        <TabsContent value="rosters">
          <RosterManager />
        </TabsContent>
        <TabsContent value="jugadores">
          <PlayersPanel />
        </TabsContent>
      </Tabs>
    </>
  )
}
