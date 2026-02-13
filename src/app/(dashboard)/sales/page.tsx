import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "lucide-react";

export default async function SalesPage() {
    const supabase = await createClient();
    // Placeholder fetching - real table might be 'sales' or 'orders'
    const { data: sales, error } = await supabase
        .from("sales")
        .select("*") // Removed customers(name) as column doesn't exist yet
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Histórico de Vendas</h1>
                <p className="text-text-secondary mt-1">Visualize todas as transações realizadas.</p>
            </div>

            <div className="card-gradient rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-text-muted">ID</TableHead>
                            <TableHead className="text-text-muted">Data</TableHead>
                            <TableHead className="text-text-muted">Cliente</TableHead>
                            <TableHead className="text-text-muted">Total Pago</TableHead>
                            <TableHead className="text-text-muted">Desconto</TableHead>
                            <TableHead className="text-text-muted">Pagamento</TableHead>
                            <TableHead className="text-text-muted">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!sales || sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-text-muted">
                                    Nenhuma venda registrada ainda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale: any) => {
                                const discount = sale.total_gross - sale.total_net;
                                return (
                                    <TableRow key={sale.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-mono text-xs text-text-secondary">
                                            {sale.id.slice(0, 8)}
                                        </TableCell>
                                        <TableCell className="text-text-primary">
                                            {new Date(sale.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-text-primary">
                                            Consumidor Final
                                        </TableCell>
                                        <TableCell className="text-green-500 font-bold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_net)}
                                        </TableCell>
                                        <TableCell className="text-text-muted">
                                            {discount > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount) : '-'}
                                        </TableCell>
                                        <TableCell className="text-text-primary capitalize">
                                            {sale.payment_method}
                                        </TableCell>
                                        <TableCell>
                                            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs">
                                                Concluído
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
