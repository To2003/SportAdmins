import type { Metadata } from "next"
import { CaptainApp } from "@/components/capitan/captain-app"

export const metadata: Metadata = {
  title: "App del Capitán",
  description: "Gestioná tu plantel, partidos y pagos.",
}

export default function CapitanPage() {
  return <CaptainApp />
}
