import { ContentGenerator } from '@/components/marketing/content-generator'
import { Separator } from '@/components/ui/separator'

export default function MarketingPage() {
    return (
        <div className="h-full flex flex-col space-y-6 pt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Marketing Studio</h2>
                    <p className="text-muted-foreground">
                        Crie conteúdo de vendas otimizado usando Inteligência Artificial.
                    </p>
                </div>
            </div>

            <Separator />

            <div className="flex-1">
                <ContentGenerator />
            </div>
        </div>
    )
}
