"use client"

import { Inbox, TrendingDown, History, Settings2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentInbox } from "@/components/pagos/payment-inbox"
import { DelinquencyTable } from "@/components/pagos/delinquency-table"
import { PaymentHistory } from "@/components/pagos/payment-history"
import { FeeConfig } from "@/components/pagos/fee-config"
import { NuevaDeudaDialog } from "@/components/pagos/nueva-deuda-dialog"

export default function PagosPage() {
  return (
    <>
      <PageHeader
        title="Pagos"
        description="Configurá los fees, validá comprobantes y controlá la morosidad de los equipos del torneo."
      >
        <NuevaDeudaDialog />
      </PageHeader>
      <Tabs defaultValue="buzon" className="gap-5">
        <div className="overflow-x-auto">
          <TabsList className="h-9">
            <TabsTrigger value="buzon">
              <Inbox className="size-4" />
              Buzón
            </TabsTrigger>
            <TabsTrigger value="morosidad">
              <TrendingDown className="size-4" />
              Estado por equipo
            </TabsTrigger>
            <TabsTrigger value="historial">
              <History className="size-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings2 className="size-4" />
              Fees
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="buzon">
          <PaymentInbox />
        </TabsContent>
        <TabsContent value="morosidad">
          <DelinquencyTable />
        </TabsContent>
        <TabsContent value="historial">
          <PaymentHistory />
        </TabsContent>
        <TabsContent value="config">
          <FeeConfig />
        </TabsContent>
      </Tabs>
    </>
  )
}
