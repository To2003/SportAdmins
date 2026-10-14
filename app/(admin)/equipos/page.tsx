import { Users, ListChecks, Shield } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamsManager } from "@/components/equipos/teams-manager"
import { RosterManager } from "@/components/equipos/roster-manager"
import { PlayersPanel } from "@/components/equipos/players-panel"

export default function EquiposPage() {
  return (
    <>
      <PageHeader
        title="Equipos"
        description="Inscribí equipos, aprobá las listas de buena fe y gestioná los jugadores del torneo."
      />
      <Tabs defaultValue="participantes" className="gap-5">
        <TabsList className="h-9 w-full max-w-lg">
          <TabsTrigger value="participantes">
            <Shield className="size-4" />
            Participantes
          </TabsTrigger>
          <TabsTrigger value="rosters">
            <ListChecks className="size-4" />
            Listas de buena fe
          </TabsTrigger>
          <TabsTrigger value="jugadores">
            <Users className="size-4" />
            Jugadores
          </TabsTrigger>
        </TabsList>
        <TabsContent value="participantes">
          <TeamsManager />
        </TabsContent>
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
