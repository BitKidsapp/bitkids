'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddChildPage() {
  const [name, setName] = useState('')
  const [ageGroup, setAgeGroup] = useState<'under8' | '8-12' | 'over12'>('8-12')
  const [walletType, setWalletType] = useState<'parent-managed' | 'own-login'>('parent-managed')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current parent
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get or create family
      let familyId: string

      const { data: existingFamily } = await supabase
        .from('families')
        .select('id')
        .eq('parent_id', user.id)
        .single()

      if (existingFamily) {
        familyId = existingFamily.id
      } else {
        const { data: newFamily, error: familyError } = await supabase
          .from('families')
          .insert({ parent_id: user.id, name: 'Our Family' })
          .select('id')
          .single()
        if (familyError) throw familyError
        familyId = newFamily.id

        // Update parent profile with family_id
        await supabase
          .from('profiles')
          .update({ family_id: familyId })
          .eq('id', user.id)
      }

      // Create child profile
      const { error: childError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          name,
          role: 'child',
          family_id: familyId,
          avatar_emoji: '🧒'
        })

      if (childError) throw childError

      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080B10]">
      {/* Nav */}
      <nav className="bg-[#0A0D12] border-b border-white/7 px-6 py-4 flex items-center gap-4">
        <a href="/dashboard" className="text-[#7A8494] hover:text-white font-bold transition-colors">
          ← Back
        </a>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD166] to-[#F7931A] flex items-center justify-center text-white font-black text-base">
            ₿K
          </div>
          <span className="text-white font-black text-xl" style={{fontFamily: 'Nunito, sans-serif'}}>
            Bit<span className="text-[#FFB347]">Kids</span>
          </span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-white font-black text-3xl mb-2" style={{fontFamily: 'Nunito, sans-serif'}}>
            Add a Child 👧
          </h1>
          <p className="text-[#7A8494] font-semibold">
            Set up a profile for your child to start earning sats.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
              Child's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Emma"
              required
              className="w-full bg-[#0F1318] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors"
            />
          </div>

          {/* Age group */}
          <div>
            <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-3">
              Age Group
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'under8', label: 'Under 8', emoji: '👶' },
                { value: '8-12', label: '8 – 12', emoji: '🧒' },
                { value: 'over12', label: 'Over 12', emoji: '🧑' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setAgeGroup(option.value as any)
                    if (option.value === 'under8') setWalletType('parent-managed')
                  }}
                  className={`py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                    ageGroup === option.value
                      ? 'border-[#F7931A] bg-[#F7931A]/10 text-[#FFB347]'
                      : 'border-white/7 text-[#7A8494] hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account type */}
          <div>
            <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-3">
              Account Type
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setWalletType('parent-managed')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  walletType === 'parent-managed'
                    ? 'border-[#F7931A] bg-[#F7931A]/08'
                    : 'border-white/7 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl">👨‍👩‍👧</span>
                  <span className="text-white font-bold">I'll manage this profile</span>
                  {ageGroup === 'under8' && (
                    <span className="text-xs bg-[#F7931A]/20 text-[#FFB347] px-2 py-0.5 rounded-full font-bold">Recommended</span>
                  )}
                </div>
                <p className="text-[#7A8494] text-sm ml-9">No separate login needed. You control the dashboard and show your child their progress.</p>
              </button>

              {ageGroup !== 'under8' && (
                <button
                  type="button"
                  onClick={() => setWalletType('own-login')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    walletType === 'own-login'
                      ? 'border-[#3AADFF] bg-[#3AADFF]/08'
                      : 'border-white/7 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">📱</span>
                    <span className="text-white font-bold">My child has their own device</span>
                    {ageGroup === 'over12' && (
                      <span className="text-xs bg-[#3AADFF]/20 text-[#3AADFF] px-2 py-0.5 rounded-full font-bold">Recommended</span>
                    )}
                  </div>
                  <p className="text-[#7A8494] text-sm ml-9">Child logs in independently on their own phone or tablet.</p>
                </button>
              )}
            </div>
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
            {loading ? 'Adding...' : 'Add Child ⚡'}
          </button>
        </form>
      </div>
    </div>
  )
}