import { Megaphone } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { SectionPlaceholder } from "@/components/section-placeholder"

export default function AvisosPage() {
  return (
    <>
      <PageHeader title="Avisos" description="Comunicados y notificaciones a los capitanes." />
      <SectionPlaceholder
        icon={Megaphone}
        title="Centro de avisos"
        description="Enviá comunicados masivos o segmentados por equipo: reprogramaciones, recordatorios de pago y novedades del torneo."
      />
    </>
  )
}
