import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

import { NewTransactionDialog } from "@/components/finance/new-transaction-dialog";

export default async function CashFlowPage() {
    const supabase = await createClient();

    const { data: transactions } = await supabase
        .from("cash_flow")
        .select("*")
        .order("transaction_date", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Fluxo de Caixa</h1>
                    <p className="text-text-secondary mt-1">Controle de entradas e saídas.</p>
                </div>
                <NewTransactionDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card rounded-2xl p-6">
                    <p className="text-text-muted text-sm pb-2">Entradas (Mês)</p>
                    <p className="text-2xl font-bold text-green-500 flex items-center gap-2">
                        <ArrowUpCircle className="w-5 h-5" /> R$ 0,00
                    </p>
                </div>
                <div className="stat-card rounded-2xl p-6">
                    <p className="text-text-muted text-sm pb-2">Saídas (Mês)</p>
                    <p className="text-2xl font-bold text-red-500 flex items-center gap-2">
                        <ArrowDownCircle className="w-5 h-5" /> R$ 0,00
                    </p>
                </div>
                <div className="stat-card rounded-2xl p-6 bg-accent/5 border-accent/20">
                    <p className="text-text-muted text-sm pb-2">Saldo Atual</p>
                    <p className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-accent" /> R$ 0,00
                    </p>
                </div>
            </div>

            <div className="card-gradient rounded-xl overflow-hidden min-h-[400px]">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-text-muted">Data</TableHead>
                            <TableHead className="text-text-muted">Descrição</TableHead>
                            <TableHead className="text-text-muted">Categoria</TableHead>
                            <TableHead className="text-right text-text-muted">Valor</TableHead>
                            <TableHead className="text-text-muted">Responsável</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!transactions || transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center text-text-muted">
                                    <div className="flex flex-col items-center justify-center opacity-50">
                                        <Wallet className="w-12 h-12 mb-3" />
                                        <p>Nenhuma movimentação registrada.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx: any) => (
                                <TableRow key={tx.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="text-text-primary">
                                        {new Date(tx.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-text-primary">{tx.description}</TableCell>
                                    <TableCell>
                                        <span className="bg-white/5 px-2 py-1 rounded text-xs text-text-secondary">
                                            {tx.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(tx.amount))}
                                    </TableCell>
                                    <TableCell className="text-text-muted text-xs">Admin</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
