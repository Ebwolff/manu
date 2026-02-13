"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Plus, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createQuote, addQuoteItem } from "@/actions/quotes"
import { useRouter } from "next/navigation"

const quoteFormSchema = z.object({
    customer_id: z.string().uuid("Selecione um cliente"),
    valid_until: z.string().optional(),
    discount_percent: z.coerce.number().min(0).max(100).default(0),
    notes: z.string().optional(),
    items: z.array(z.object({
        product_id: z.string().uuid().optional(),
        description: z.string().min(1, "Descrição é obrigatória"),
        quantity: z.coerce.number().min(1, "Mínimo 1"),
        unit_price: z.coerce.number().min(0, "Mínimo 0"),
    })).min(1, "Adicione pelo menos um item")
})

type QuoteFormValues = z.infer<typeof quoteFormSchema>

interface QuoteFormProps {
    customers: { id: string; name: string }[]
    products: { id: string; name: string; sku: string; sale_price: number; current_stock: number }[]
}

export function QuoteForm({ customers, products }: QuoteFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<QuoteFormValues>({
        // @ts-expect-error - zodResolver types are often tricky with nested arrays
        resolver: zodResolver(quoteFormSchema),
        defaultValues: {
            customer_id: "",
            items: [{ description: "", quantity: 1, unit_price: 0 }],
            discount_percent: 0,
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    })

    const watchItems = form.watch("items")
    const watchDiscount = form.watch("discount_percent")

    const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * (item.unit_price || 0)), 0)
    const discountAmount = (subtotal * (watchDiscount || 0)) / 100
    const total = subtotal - discountAmount

    const onSubmit = async (values: QuoteFormValues) => {
        setIsSubmitting(true)
        try {
            const quoteResult = await createQuote({
                customer_id: values.customer_id,
                valid_until: values.valid_until,
                notes: values.notes,
                discount_percent: values.discount_percent,
                discount_amount: (subtotal * values.discount_percent) / 100
            })

            if (!quoteResult.success) {
                throw new Error(typeof quoteResult.error === 'string' ? quoteResult.error : "Erro ao criar orçamento")
            }

            const quoteId = quoteResult.data.id

            for (const item of values.items) {
                await addQuoteItem({
                    quote_id: quoteId,
                    product_id: item.product_id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                })
            }

            router.push('/quotes')
            router.refresh()
        } catch (error: any) {
            console.error("Submit error:", error)
            alert(error.message || "Erro desconhecido")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            form.setValue(`items.${index}.description`, product.name)
            form.setValue(`items.${index}.unit_price`, product.sale_price)
            form.setValue(`items.${index}.product_id`, product.id)
        }
    }

    // Usar any para o control para evitar problemas de compatibilidade de tipos no build do Next.js
    const control = form.control as any

    return (
        <Form {...form}>
            {/* @ts-ignore - types are tricky with handleSubmit and Zod */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="customer_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cliente</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-background border-white/10">
                                            <SelectValue placeholder="Selecione um cliente" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-surface border-white/10 max-h-60">
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="valid_until"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Válido até</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} className="bg-background border-white/10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-text-primary">Itens</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ description: "", quantity: 1, unit_price: 0 })}
                            className="border-white/10 hover:bg-white/5"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="col-span-12 md:col-span-5">
                                    <FormField
                                        control={control}
                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index > 0 ? "sr-only" : ""}>Descrição / Produto</FormLabel>
                                                <div className="relative">
                                                    <Input {...field} placeholder="Escolha um produto ou digite..." className="pr-10" />
                                                    <Select onValueChange={(val) => handleProductSelect(index, val)}>
                                                        <SelectTrigger className="absolute right-0 top-0 w-10 h-10 border-none bg-transparent hover:bg-white/5 p-0 flex justify-center items-center">
                                                            <Search className="w-4 h-4 text-text-muted" />
                                                        </SelectTrigger>
                                                        <SelectContent align="end" className="bg-surface border-white/10 max-h-60">
                                                            {products.map(p => (
                                                                <SelectItem key={p.id} value={p.id}>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{p.name}</span>
                                                                        <span className="text-xs text-text-muted">{p.sku} - R$ {p.sale_price}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-4 md:col-span-2">
                                    <FormField
                                        control={control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index > 0 ? "sr-only" : ""}>Qtd</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-5 md:col-span-3">
                                    <FormField
                                        control={control}
                                        name={`items.${index}.unit_price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={index > 0 ? "sr-only" : ""}>Preço Unit. (R$)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-3 md:col-span-2 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                    <FormField
                        control={control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Observações</FormLabel>
                                <FormControl>
                                    <textarea
                                        {...field}
                                        className="w-full h-32 rounded-lg bg-background border border-white/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                                        placeholder="Informações adicionais para o cliente..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        <div className="bg-surface-secondary/50 rounded-xl p-6 space-y-3">
                            <div className="flex justify-between items-center text-text-secondary">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                            </div>

                            <div className="flex justify-between items-center gap-4">
                                <FormLabel className="flex-1">Desconto (%)</FormLabel>
                                <FormField
                                    control={control}
                                    name="discount_percent"
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            {...field}
                                            className="w-20 bg-background border-white/10"
                                        />
                                    )}
                                />
                            </div>

                            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                <span className="font-bold text-text-primary">Total Final</span>
                                <span className="text-2xl font-bold text-accent">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                </span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-gradient-to-r from-accent to-orange-600 hover:opacity-90 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Gerando Orçamento..." : "Gerar Orçamento"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
