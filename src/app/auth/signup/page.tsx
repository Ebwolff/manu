"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Validations
        if (password !== confirmPassword) {
            setError("As senhas não coincidem")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres")
            setLoading(false)
            return
        }

        const supabase = createClient()

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <div className="card-gradient rounded-2xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                            <UserPlus className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-text-primary mb-2">Cadastro Realizado!</h2>
                        <p className="text-text-muted mb-6">
                            Verifique seu email para confirmar sua conta antes de fazer login.
                        </p>
                        <Link href="/auth/login">
                            <Button className="w-full bg-accent hover:bg-accent-hover text-white">
                                Ir para Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-orange-600 shadow-lg mb-4">
                        <span className="text-white font-bold text-3xl">M</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary">Manu Acessórios</h1>
                    <p className="text-text-muted mt-1">Sistema de Gestão</p>
                </div>

                {/* Signup Form */}
                <div className="card-gradient rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">Criar Conta</h2>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-text-secondary">Nome Completo</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 bg-background border-white/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-text-secondary">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-background border-white/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-text-secondary">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 bg-background border-white/10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-text-muted hover:text-text-primary"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-text-secondary">Confirmar Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 bg-background border-white/10"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-6"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <UserPlus className="w-4 h-4" />
                            )}
                            {loading ? "Criando..." : "Criar Conta"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-text-muted text-sm">
                            Já tem uma conta?{" "}
                            <Link href="/auth/login" className="text-accent hover:underline font-medium">
                                Fazer Login
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-text-muted text-xs mt-6">
                    © 2026 Manu Acessórios. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}
