import { ShieldAlert } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { SectionPlaceholder } from "@/components/section-placeholder"

export default function SancionesPage() {
  return (
    <>
      <PageHeader title="Sanciones" description="Tarjetas, suspensiones y multas disciplinarias." />
      <SectionPlaceholder
        icon={ShieldAlert}
        title="Registro disciplinario"
        description="Cargá y seguí sanciones por conducta antideportiva, suspensiones de jugadores y multas asociadas a cada equipo."
      />
    </>
  )
}
