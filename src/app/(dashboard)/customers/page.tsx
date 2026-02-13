import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { NewCustomerDialog } from "@/components/customers/new-customer-dialog";

export default async function CustomersPage() {
    const supabase = await createClient();
    const { data: customers, error } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Clientes</h1>
                    <p className="text-text-secondary mt-1">Gerencie sua base de clientes.</p>
                </div>
                <NewCustomerDialog />
            </div>

            <div className="card-gradient rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-text-muted">Nome</TableHead>
                            <TableHead className="text-text-muted">WhatsApp</TableHead>
                            <TableHead className="text-text-muted">Modelo do Aparelho</TableHead>
                            <TableHead className="text-text-muted">Última Compra</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!customers || customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-text-muted">
                                    Nenhum cliente cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer: any) => (
                                <TableRow key={customer.id} className="border-white/5 hover:bg-white/5 cursor-pointer">
                                    <TableCell className="text-text-primary font-medium">
                                        {customer.name}
                                    </TableCell>
                                    <TableCell className="text-text-secondary">
                                        {customer.whatsapp || "-"}
                                    </TableCell>
                                    <TableCell className="text-text-primary">
                                        <span className="bg-white/5 px-2 py-1 rounded text-xs text-text-secondary">
                                            {customer.current_device_model || "Não informado"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-text-muted">
                                        {customer.last_purchase_date
                                            ? new Date(customer.last_purchase_date).toLocaleDateString()
                                            : "Nunca comprou"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
