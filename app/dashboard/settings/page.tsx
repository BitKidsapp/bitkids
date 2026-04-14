'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [bitcoinAddress, setBitcoinAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
      setBitcoinAddress(profile?.bitcoin_address || '')
      setLoading(false)
    }
    getData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ bitcoin_address: bitcoinAddress })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B10] flex items-center justify-center">
        <div className="text-[#F7931A] text-2xl font-black">Loading... ⚡</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080B10]">
      <nav className="bg-[#0A0D12] border-b border-white/7 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="text-[#7A8494] hover:text-white font-bold transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Back
        </button>
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
            Settings ⚙️
          </h1>
          <p className="text-[#7A8494] font-semibold">
            Manage your profile and Bitcoin wallet.
          </p>
        </div>

        {/* Profile */}
        <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#F7931A]/20 flex items-center justify-center text-3xl">
              {profile?.avatar_emoji || '👤'}
            </div>
            <div>
              <div className="text-white font-black text-xl">{profile?.name}</div>
              <div className="text-[#7A8494] text-sm font-semibold capitalize">{profile?.role}</div>
            </div>
          </div>
        </div>

        {/* Bitcoin Address */}
        <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#F7931A]/10 flex items-center justify-center text-xl">
              ₿
            </div>
            <div>
              <div className="text-white font-black text-base">Bitcoin Address</div>
              <div className="text-[#7A8494] text-xs font-semibold">
                Where sats get sent when you approve a chore
              </div>
            </div>
          </div>

          <input
            type="text"
            value={bitcoinAddress}
            onChange={e => setBitcoinAddress(e.target.value)}
            placeholder="bc1q... or lightning address"
            className="w-full bg-[#080B10] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors font-mono text-sm mb-4"
          />

          <div className="bg-[#080B10] border border-white/7 rounded-xl p-4 mb-4">
            <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-2">
              ℹ️ How it works
            </div>
            <div className="text-[#7A8494] text-xs font-semibold leading-relaxed">
              BitKids never touches your Bitcoin. When you approve a chore, your wallet address is shown as a reminder to send the sats yourself. You stay in full control.
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm font-bold mb-4">
              ✓ Saved successfully!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#FFB347] to-[#F7931A] text-white font-black py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Address ⚡'}
          </button>
        </div>
      </div>
    </div>
  )
}