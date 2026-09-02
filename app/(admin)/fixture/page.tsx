import { PageHeader } from "@/components/page-header"
import { FixtureBoard } from "@/components/fixture/fixture-board"

export default function FixturePage() {
  return (
    <>
      <PageHeader
        title="Fixture"
        description="Armá los cruces, asigná canchas y horarios, y cargá los resultados por jornada."
      />
      <FixtureBoard />
    </>
  )
}
