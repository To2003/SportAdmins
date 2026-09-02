import { Landmark } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { SectionPlaceholder } from "@/components/section-placeholder"

export default function TesoreriaPage() {
  return (
    <>
      <PageHeader title="Tesorería" description="Ingresos, egresos y balance general del torneo." />
      <SectionPlaceholder
        icon={Landmark}
        title="Balance del torneo"
        description="Acá vas a ver el flujo de caja completo: inscripciones cobradas, alquiler de canchas, arbitraje y el balance neto por jornada."
      />
    </>
  )
}
