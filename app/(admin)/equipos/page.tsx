import { Users, Shield } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamsManager } from "@/components/equipos/teams-manager"
import { PlayersPanel } from "@/components/equipos/players-panel"

export default function EquiposPage() {
  return (
    <>
      <PageHeader
        title="Equipos"
        description="Inscribí los equipos participantes y gestioná los jugadores del torneo."
      />
      <Tabs defaultValue="participantes" className="gap-5">
        <TabsList className="h-9 w-full max-w-sm">
          <TabsTrigger value="participantes">
            <Shield className="size-4" />
            Participantes
          </TabsTrigger>
          <TabsTrigger value="jugadores">
            <Users className="size-4" />
            Jugadores
          </TabsTrigger>
        </TabsList>
        <TabsContent value="participantes">
          <TeamsManager />
        </TabsContent>
        <TabsContent value="jugadores">
          <PlayersPanel />
        </TabsContent>
      </Tabs>
    </>
  )
}
