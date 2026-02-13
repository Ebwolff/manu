import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema
const leadSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    phone: z.string().optional(),
    source: z.string().default('system'),
    notes: z.string().optional()
})

const API_SECRET = process.env.API_SECRET_KEY || 'manu-acessorios-secret'

export async function POST(request: Request) {
    try {
        // Create admin client inside the handler to prevent issues during build
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // 1. Validate API secret
        const authHeader = request.headers.get('x-api-secret')
        if (authHeader !== API_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse and validate body
        const body = await request.json()
        const parsed = leadSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { name, phone, source, notes } = parsed.data

        // 3. Insert into customers table
        const { data, error } = await supabaseAdmin
            .from('customers')
            .insert([
                {
                    name,
                    whatsapp: phone,
                    source,
                    status: 'lead',
                    current_device_model: notes,
                    store_id: process.env.DEFAULT_STORE_ID || '00000000-0000-0000-0000-000000000001'
                }
            ])
            .select()

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, lead: data }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
}
