"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

// NOTE: This page should ideally be in a separate layout group (e.g. (auth)) 
// to avoid showing the sidebar/header. 
// For now we will implement it here and handle redirect.

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            router.push("/");
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-surface">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-lg mb-4">
                        <span className="text-white font-bold text-2xl">C</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">
                        Acesse sua conta
                    </h2>
                    <p className="mt-2 text-sm text-text-muted">
                        Entre com suas credenciais para gerenciar a loja
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="space-y-2">
                            <Label htmlFor="email-address">Email</Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="bg-background text-text-primary border-white/10"
                                placeholder="admin@cellshop.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="bg-background text-text-primary border-white/10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="group relative flex w-full justify-center bg-accent hover:bg-accent-hover text-white py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
