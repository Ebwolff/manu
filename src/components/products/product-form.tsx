"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { calculateSuggestedPrice } from "@/lib/pricing-config"
import { Product } from "@/types/schema"

// Product types for quick selection
const PRODUCT_TYPES = [
    "Simples",
    "Premium",
    "Anti-Impacto",
    "Silicone",
    "Transparente",
    "Carteira",
    "MagSafe",
    "Luxo",
    "Outro"
]

const formSchema = z.object({
    sku: z.string().min(2, "SKU muito curto").max(50),
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    category: z.string().min(2),
    compatible_model: z.string().optional(),
    product_type: z.string().optional(),
    cost_price: z.coerce.number().min(0, "Informe o valor de aquisição"),
    current_stock: z.coerce.number().int().min(0),
    min_stock: z.coerce.number().int().min(0),
})

type FormValues = z.infer<typeof formSchema>

interface ProductFormProps {
    product?: Product
    onClose?: () => void
}

export function ProductForm({ product, onClose }: ProductFormProps) {
    const router = useRouter()
    const isEditing = !!product

    const form = useForm<FormValues>({
        // @ts-expect-error - zodResolver types are incompatible with react-hook-form v7.54+
        resolver: zodResolver(formSchema),
        defaultValues: {
            sku: product?.sku || "",
            name: product?.name || "",
            category: product?.category || "Smartphone",
            compatible_model: product?.compatible_models?.[0] || "",
            product_type: "Simples",
            cost_price: product?.cost_price || 0,
            current_stock: product?.current_stock || 0,
            min_stock: product?.min_stock || 5,
        },
    })

    // Type-safe control wrapper to fix FormField compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const control = form.control as any

    async function onSubmit(values: FormValues) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Calculate sale price automatically using pricing rules
        const sale_price = calculateSuggestedPrice(values.cost_price)

        if (isEditing && product) {
            const { error } = await supabase
                .from('products')
                .update({
                    ...values,
                    sale_price,
                    updated_at: new Date().toISOString()
                })
                .eq('id', product.id)

            if (error) {
                console.error(error)
                alert("Erro ao atualizar produto")
            } else {
                router.refresh()
                if (onClose) onClose()
            }
        } else {
            const { error } = await supabase.from('products').insert({
                ...values,
                sale_price,
                store_id: user?.id || '00000000-0000-0000-0000-000000000001',
            })

            if (error) {
                console.error(error)
                alert("Erro ao salvar produto")
            } else {
                router.refresh()
                if (onClose) onClose()
            }
        }
    }

    // Preview of calculated sale price
    const costPrice = form.watch("cost_price")
    const previewSalePrice = costPrice > 0 ? calculateSuggestedPrice(costPrice) : 0

    return (
        <Form {...form}>
            {/* @ts-expect-error - handleSubmit types incompatible with FormValues */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-4">
                    <FormField
                        control={control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    <Input placeholder="CAP-IP13-PRE" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="current_stock"
                        render={({ field }) => (
                            <FormItem className="w-24">
                                <FormLabel>Qtd</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Produto</FormLabel>
                            <FormControl>
                                <Input placeholder="Capa Anti-Impacto Premium" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Modelo Compatível e Tipo */}
                <div className="flex gap-4">
                    <FormField
                        control={control}
                        name="compatible_model"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Modelo Compatível</FormLabel>
                                <FormControl>
                                    <Input placeholder="iPhone 13, Galaxy S23..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="product_type"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-background border-white/10">
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-surface border-white/10">
                                        {PRODUCT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type} className="hover:bg-white/5">
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-4">
                    <FormField
                        control={control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Categoria</FormLabel>
                                <FormControl>
                                    <Input placeholder="Capinhas" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="cost_price"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Custo (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Preview of calculated sale price */}
                {costPrice > 0 && (
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted">Preço de Venda (calculado):</span>
                            <span className="text-accent font-bold text-lg">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(previewSalePrice)}
                            </span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">Baseado nas regras de precificação configuradas.</p>
                    </div>
                )}

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-bold">
                    {isEditing ? "Atualizar Produto" : "Salvar Produto"}
                </Button>
            </form>
        </Form>
    )
}
