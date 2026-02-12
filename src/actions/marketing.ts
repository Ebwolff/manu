'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Validation schema
const generateContentSchema = z.object({
    productId: z.string().uuid('ID de produto inválido'),
    tone: z.string().min(1, 'Tom é obrigatório'),
    platform: z.string().min(1, 'Plataforma é obrigatória')
})

export async function generateMarketingContent(productId: string, tone: string, platform: string) {
    try {
        // Validate inputs
        const parsed = generateContentSchema.safeParse({ productId, tone, platform })
        if (!parsed.success) {
            return { success: false, error: parsed.error.flatten().fieldErrors }
        }

        const supabase = await createClient()

        // 1. Fetch Product Details
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single()

        if (error || !product) {
            return { success: false, error: 'Produto não encontrado' }
        }

        // 2. Prepare Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Atue como um especialista em Marketing Digital para uma loja de acessórios de celular chamada "Manu Acessórios".
      
      Crie um conteúdo para a plataforma: ${platform}.
      Tom de Voz: ${tone}.
      
      Detalhes do Produto:
      Nome: ${product.name}
      Categoria: ${product.category}
      Preço: R$ ${product.sale_price}
      Modelos Compatíveis: ${JSON.stringify(product.compatible_models)}
      
      O conteúdo deve ser formatado em Markdown. Se for Instagram, inclua emojis e hashtags. Se for Email, inclua um Assunto chamativo.
    `

        // 3. Generate Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return { success: true, content: text }

    } catch (error) {
        console.error('Erro na IA:', error)
        if (error instanceof Error) {
            return { success: false, error: error.message }
        }
        return { success: false, error: 'Erro ao gerar conteúdo' }
    }
}
