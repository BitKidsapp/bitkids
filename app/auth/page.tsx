'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'parent' | 'child'>('parent')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) setError(error.message)
      else window.location.href = '/dashboard'
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) {
        setError(error.message)
     } else if (data.user) {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      name,
      role,
      avatar_emoji: role === 'parent' ? '👨‍👩‍👧' : '🧒'
    })
        if (profileError) setError(profileError.message)
        else window.location.href = '/dashboard'
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080B10] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD166] to-[#F7931A] flex items-center justify-center text-white font-black text-xl">
              ₿K
            </div>
            <span className="text-white font-black text-3xl" style={{fontFamily: 'Nunito, sans-serif'}}>
              Bit<span className="text-[#FFB347]">Kids</span>
            </span>
          </div>
          <p className="text-[#7A8494] text-sm font-semibold">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-8">
          {/* Toggle */}
          <div className="flex bg-[#161B22] rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                isLogin
                  ? 'bg-[#F7931A] text-white'
                  : 'text-[#7A8494] hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                !isLogin
                  ? 'bg-[#F7931A] text-white'
                  : 'text-[#7A8494] hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Satoshi Nakamoto"
                    required
                    className="w-full bg-[#161B22] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('parent')}
                      className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        role === 'parent'
                          ? 'border-[#F7931A] bg-[#F7931A]/10 text-[#FFB347]'
                          : 'border-white/7 text-[#7A8494] hover:border-white/20'
                      }`}
                    >
                      👨‍👩‍👧 Parent
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('child')}
                      className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        role === 'child'
                          ? 'border-[#3AADFF] bg-[#3AADFF]/10 text-[#3AADFF]'
                          : 'border-white/7 text-[#7A8494] hover:border-white/20'
                      }`}
                    >
                      🧒 Kid
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#161B22] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#161B22] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FFB347] to-[#F7931A] text-white font-black py-4 rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '...' : isLogin ? 'Log In ⚡' : 'Create Account ⚡'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#7A8494] text-xs mt-6">
          Free forever · Open source · Non-custodial
        </p>
      </div>
    </div>
  )
}