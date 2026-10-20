"use client"

import { Inbox, TrendingDown, History, Settings2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentInbox } from "@/components/pagos/payment-inbox"
import { DelinquencyTable } from "@/components/pagos/delinquency-table"
import { PaymentHistory } from "@/components/pagos/payment-history"
import { FeeConfig } from "@/components/pagos/fee-config"
import { useTorneo } from "@/lib/torneo-store"

export default function PagosPage() {
  const { puede } = useTorneo()
  const valida = puede("pagos.validar")
  const configura = puede("pagos.configurar")
  return (
    <>
      <PageHeader
        title="Pagos"
        description={
          valida || configura
            ? "Configurá los fees, validá comprobantes y controlá la morosidad de los equipos del torneo."
            : "Estado de pagos de tu equipo."
        }
      />
      <Tabs defaultValue={valida ? "buzon" : configura ? "config" : "morosidad"} className="gap-5">
        <div className="overflow-x-auto">
          <TabsList className="h-9">
            {valida && (
              <TabsTrigger value="buzon">
                <Inbox className="size-4" />
                Buzón
              </TabsTrigger>
            )}
            <TabsTrigger value="morosidad">
              <TrendingDown className="size-4" />
              Estado por equipo
            </TabsTrigger>
            <TabsTrigger value="historial">
              <History className="size-4" />
              Historial
            </TabsTrigger>
            {configura && (
              <TabsTrigger value="config">
                <Settings2 className="size-4" />
                Fees
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        {valida && (
          <TabsContent value="buzon">
            <PaymentInbox />
          </TabsContent>
        )}
        <TabsContent value="morosidad">
          <DelinquencyTable />
        </TabsContent>
        <TabsContent value="historial">
          <PaymentHistory />
        </TabsContent>
        {configura && (
          <TabsContent value="config">
            <FeeConfig />
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}
