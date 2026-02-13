"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react"
import Link from "next/link"

import { motion, AnimatePresence } from "framer-motion"

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2
                        }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-orange-600 shadow-xl shadow-accent/20 mb-4 border border-white/10"
                    >
                        <span className="text-white font-bold text-4xl">M</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-text-primary tracking-tight"
                    >
                        Manu Acessórios
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-text-muted mt-2 font-medium"
                    >
                        Crie sua conta administrativa
                    </motion.p>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6 border border-green-500/20">
                                <UserPlus className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-3">Cadastro Realizado!</h2>
                            <p className="text-text-muted mb-8 leading-relaxed">
                                Enviamos um e-mail de confirmação. Por favor, valide sua conta para acessar o sistema. Seguir as instruções enviadas para seu e-mail.
                            </p>
                            <Link href="/auth/login">
                                <Button className="w-full h-14 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all">
                                    Ir para Login
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl pointer-events-none" />

                            <h2 className="text-xl font-semibold text-text-primary mb-8 text-center">Criar Conta</h2>

                            <form onSubmit={handleSignUp} className="space-y-5 relative">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-text-secondary text-sm font-medium ml-1">Nome Completo</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Seu nome"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-12 h-12 bg-black/20 border-white/5 focus:border-accent/50 focus:ring-accent/20 transition-all rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-text-secondary text-sm font-medium ml-1">Email Profissional</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 h-12 bg-black/20 border-white/5 focus:border-accent/50 focus:ring-accent/20 transition-all rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-text-secondary text-sm font-medium ml-1">Senha</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-12 pr-12 h-12 bg-black/20 border-white/5 focus:border-accent/50 focus:ring-accent/20 transition-all rounded-xl"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-text-secondary text-sm font-medium ml-1">Confirmar Senha</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                                            <Input
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pl-12 h-12 bg-black/20 border-white/5 focus:border-accent/50 focus:ring-accent/20 transition-all rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center font-medium"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 gap-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Criar Minha Conta</span>
                                            <UserPlus className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-text-muted hover:text-accent transition-colors font-medium">
                                    Já possui acesso? <Link href="/auth/login" className="text-accent underline underline-offset-4 decoration-accent/30 font-bold ml-1">Fazer Login</Link>
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-text-muted/60 text-xs mt-10 font-medium tracking-widest uppercase"
                >
                    © 2026 Manu Acessórios
                </motion.p>
            </motion.div>
        </div>
    )
}
