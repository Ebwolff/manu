'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateMarketingContent } from '@/actions/marketing'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles, Copy, AlertCircle } from 'lucide-react'

export function ContentGenerator() {
    const [products, setProducts] = useState<any[]>([])
    const [selectedProduct, setSelectedProduct] = useState('')
    const [tone, setTone] = useState('profissional')
    const [platform, setPlatform] = useState('instagram')
    const [generatedContent, setGeneratedContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase.from('products').select('id, name').limit(100)
                if (error) {
                    console.error('Erro ao buscar produtos:', error)
                    setError('Erro ao carregar produtos.')
                }
                if (data) setProducts(data)
            } catch (e) {
                console.error('Supabase client error:', e)
                setError('Erro de conexão com banco de dados.')
            }
        }
        fetchProducts()
    }, [])

    async function handleGenerate() {
        if (!selectedProduct) {
            // Fallback alert
            alert('Selecione um produto')
            return
        }

        setIsLoading(true)
        setGeneratedContent('')
        setError(null)

        try {
            const result = await generateMarketingContent(selectedProduct, tone, platform)

            if (result.success && result.content) {
                setGeneratedContent(result.content)
            } else {
                const errorMsg = typeof result.error === 'string' ? result.error : 'Erro ao gerar'
                setError(errorMsg)
            }
        } catch (e) {
            setError('Erro ao comunicar com a IA.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[600px]">
            {/* Left Column: Inputs */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        Configuração
                    </CardTitle>
                    <CardDescription>Defina os parâmetros para a IA criar seu conteúdo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 flex-1">

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Produto</Label>
                        <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.length === 0 ? (
                                    <div className="p-2 text-sm text-gray-500">
                                        {error ? 'Erro ao carregar' : 'Carregando produtos...'}
                                    </div>
                                ) : (
                                    products.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Plataforma</Label>
                            <Select onValueChange={setPlatform} value={platform}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="instagram">Instagram (Post)</SelectItem>
                                    <SelectItem value="stories">Instagram (Stories)</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp (Mensagem)</SelectItem>
                                    <SelectItem value="email">Email Marketing</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tom de Voz</Label>
                            <Select onValueChange={setTone} value={tone}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="criativo">🎨 Criativo & Divertido</SelectItem>
                                    <SelectItem value="profissional">👔 Profissional & Técnico</SelectItem>
                                    <SelectItem value="urgente">🔥 Urgente (Promoção)</SelectItem>
                                    <SelectItem value="minimalista">✨ Minimalista</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando com IA...
                                </>
                            ) : (
                                'Gerar Conteúdo'
                            )}
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {/* Right Column: Output */}
            <Card className="flex flex-col bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
                    <CardTitle>Resultado</CardTitle>
                    {generatedContent && (
                        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(generatedContent)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="flex-1 p-6 font-medium text-slate-700 dark:text-slate-300">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] opacity-50 space-y-4">
                            <Sparkles className="w-12 h-12 animate-pulse text-blue-400" />
                            <p>Criando mágica...</p>
                        </div>
                    ) : generatedContent ? (
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {generatedContent}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                            <p>O conteúdo gerado aparecerá aqui.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
