"use client"

import { Inbox, TrendingDown } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentInbox } from "@/components/pagos/payment-inbox"
import { DelinquencyTable } from "@/components/pagos/delinquency-table"
import { NuevaDeudaDialog } from "@/components/pagos/nueva-deuda-dialog"

export default function PagosPage() {
  return (
    <>
      <PageHeader
        title="Pagos"
        description="Validá comprobantes y controlá la morosidad de los equipos del torneo."
      >
        <NuevaDeudaDialog />
      </PageHeader>
      <Tabs defaultValue="buzon" className="gap-5">
        <TabsList className="h-9 w-full max-w-md">
          <TabsTrigger value="buzon">
            <Inbox className="size-4" />
            Buzón de validación
          </TabsTrigger>
          <TabsTrigger value="morosidad">
            <TrendingDown className="size-4" />
            Morosidad
          </TabsTrigger>
        </TabsList>
        <TabsContent value="buzon">
          <PaymentInbox />
        </TabsContent>
        <TabsContent value="morosidad">
          <DelinquencyTable />
        </TabsContent>
      </Tabs>
    </>
  )
}
