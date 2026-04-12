'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [chores, setChores] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

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

      if (profile?.role === 'parent') {
        const { data: family } = await supabase
          .from('families')
          .select('id')
          .eq('parent_id', user.id)
          .single()

        if (family) {
          const { data: chores } = await supabase
            .from('chores')
            .select('*')
            .eq('family_id', family.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

          setChores(chores || [])

          const { data: children } = await supabase
            .from('profiles')
            .select('*')
            .eq('family_id', family.id)
            .eq('role', 'child')

          setChildren(children || [])

          const { count } = await supabase
            .from('completions')
            .select('*', { count: 'exact', head: true })
            .eq('family_id', family.id)
            .eq('status', 'pending')

          setPendingCount(count || 0)
        }
      }

      setLoading(false)
    }
    getData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const getChoreEmoji = (type: string) => {
    if (type === 'learning') return '🎓'
    if (type === 'task') return '✅'
    return '🧹'
  }

  const getFrequencyLabel = (freq: string) => {
    if (freq === 'one-time') return 'One Time'
    if (freq === 'daily') return 'Daily'
    if (freq === 'weekly') return 'Weekly'
    if (freq === 'monthly') return 'Monthly'
    return freq
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
          <span className="text-[#7A8494] text-sm font-semibold">{profile?.name}</span>
          <button onClick={handleSignOut} className="text-[#7A8494] hover:text-white text-sm font-bold transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-white font-black text-4xl mb-2" style={{fontFamily: 'Nunito, sans-serif'}}>
            Welcome, {profile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[#7A8494] font-semibold">
            {profile?.role === 'parent'
              ? "Manage your family's chores and commissions"
              : 'Check your chores and earn some sats ⚡'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-6">
            <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-2">Active Chores</div>
            <div className="text-white font-black text-3xl" style={{fontFamily: 'Nunito, sans-serif'}}>{chores.length}</div>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard/verify'}
            className="bg-[#0F1318] border border-white/7 rounded-2xl p-6 text-left hover:border-[#F7931A]/40 transition-colors cursor-pointer w-full"
          >
            <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-2">Pending Review</div>
            <div className="text-white font-black text-3xl" style={{fontFamily: 'Nunito, sans-serif'}}>{pendingCount}</div>
          </button>
          <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-6">
            <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-2">Children</div>
            <div className="text-[#F7931A] font-black text-3xl" style={{fontFamily: 'Nunito, sans-serif'}}>{children.length}</div>
          </div>
        </div>

        {profile?.role === 'parent' && (
          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              onClick={() => window.location.href = '/dashboard/create-chore'}
              className="bg-gradient-to-r from-[#FFB347] to-[#F7931A] text-white font-black py-4 px-6 rounded-2xl text-lg hover:opacity-90 transition-opacity flex items-center gap-3"
            >
              <span className="text-2xl">➕</span>
              Create Chore
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/add-child'}
              className="bg-[#0F1318] border border-white/7 text-white font-black py-4 px-6 rounded-2xl text-lg hover:border-[#F7931A]/40 transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">👤</span>
              Add Child
            </button>
          </div>
        )}

        {profile?.role === 'parent' && children.length > 0 && (
          <div className="mb-10">
            <h2 className="text-white font-black text-xl mb-4" style={{fontFamily: 'Nunito, sans-serif'}}>
              Your Kids
            </h2>
            <div className="flex gap-3">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => window.location.href = `/dashboard/kid/${child.id}`}
                  className="bg-[#0F1318] border border-white/7 rounded-2xl p-4 flex items-center gap-3 hover:border-[#F7931A]/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F7931A]/20 flex items-center justify-center text-xl">
                    {child.avatar_emoji || '🧒'}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">{child.name}</div>
                    <div className="text-[#7A8494] text-xs font-semibold">0 sats earned</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {chores.length > 0 ? (
          <div>
            <h2 className="text-white font-black text-xl mb-4" style={{fontFamily: 'Nunito, sans-serif'}}>
              Active Chores
            </h2>
            <div className="space-y-3">
              {chores.map(chore => (
                <div key={chore.id} className="bg-[#0F1318] border border-white/7 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {getChoreEmoji(chore.chore_type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-base mb-1">{chore.title}</div>
                    <div className="text-[#7A8494] text-sm font-semibold">
                      {getFrequencyLabel(chore.frequency)}
                      {chore.description && ` · ${chore.description}`}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[#F7931A] font-black text-lg" style={{fontFamily: 'Nunito, sans-serif'}}>
                      {chore.sats_value.toLocaleString()} sats
                    </div>
                    <div className="text-[#7A8494] text-xs font-semibold">
                      {chore.chore_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-white font-black text-2xl mb-3" style={{fontFamily: 'Nunito, sans-serif'}}>
              {profile?.role === 'parent' ? 'Set up your family' : 'No chores yet'}
            </h2>
            <p className="text-[#7A8494] font-semibold max-w-sm mx-auto">
              {profile?.role === 'parent'
                ? 'Add your children and create your first chore to get started.'
                : "Your parent hasn't assigned any chores yet. Check back soon!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}