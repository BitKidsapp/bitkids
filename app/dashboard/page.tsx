'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
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
      {/* Nav */}
      <nav className="bg-[#0A0D12] border-b border-white/7 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD166] to-[#F7931A] flex items-center justify-center text-white font-black text-base">
            ₿K
          </div>
          <span className="text-white font-black text-xl" style={{fontFamily: 'Nunito, sans-serif'}}>
            Bit<span className="text-[#FFB347]">Kids</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#7A8494] text-sm font-semibold">
            {profile?.name}
          </span>
          <button
            onClick={handleSignOut}
            className="text-[#7A8494] hover:text-white text-sm font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-white font-black text-4xl mb-2" style={{fontFamily: 'Nunito, sans-serif'}}>
            Welcome, {profile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[#7A8494] font-semibold">
            {profile?.role === 'parent'
              ? 'Manage your family\'s chores and commissions'
              : 'Check your chores and earn some sats ⚡'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-6">
            <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-2">Active Chores</div>
            <div className="text-white font-black text-3xl" style={{fontFamily: 'Nunito, sans-serif'}}>0</div>
          </div>
          <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-6">
            <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-2">Pending Review</div>
            <div className="text-white font-black text-3xl" style={{fontFamily: 'Nunito, sans-serif'}}>0</div>
          </div>
          <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-6">
            <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-2">Sats Earned</div>
            <div className="text-[#F7931A] font-black text-3xl" style={{fontFamily: 'Nunito, sans-serif'}}>0</div>
          </div>
        </div>

        {/* Actions */}
        {profile?.role === 'parent' && (
          <div className="grid grid-cols-2 gap-4 mb-10">
            <button className="bg-gradient-to-r from-[#FFB347] to-[#F7931A] text-white font-black py-4 px-6 rounded-2xl text-lg hover:opacity-90 transition-opacity flex items-center gap-3">
              <span className="text-2xl">➕</span>
              Create Chore
            </button>
            <button className="bg-[#0F1318] border border-white/7 text-white font-black py-4 px-6 rounded-2xl text-lg hover:border-[#F7931A]/40 transition-colors flex items-center gap-3">
              <span className="text-2xl">👤</span>
              Add Child
            </button>
          </div>
        )}

        {/* Empty state */}
        <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-white font-black text-2xl mb-3" style={{fontFamily: 'Nunito, sans-serif'}}>
            {profile?.role === 'parent' ? 'Set up your family' : 'No chores yet'}
          </h2>
          <p className="text-[#7A8494] font-semibold max-w-sm mx-auto">
            {profile?.role === 'parent'
              ? 'Add your children and create your first chore to get started.'
              : 'Your parent hasn\'t assigned any chores yet. Check back soon!'}
          </p>
        </div>
      </div>
    </div>
  )
}