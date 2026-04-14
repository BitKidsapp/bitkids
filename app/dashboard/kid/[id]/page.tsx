'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function KidDashboardPage() {
  const params = useParams()
  const childId = params.id as string

  const [child, setChild] = useState<any>(null)
  const [chores, setChores] = useState<any[]>([])
  const [completions, setCompletions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tapping, setTapping] = useState<string | null>(null)
  const [editingAddress, setEditingAddress] = useState(false)
  const [bitcoinAddress, setBitcoinAddress] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressSaved, setAddressSaved] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data: child } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', childId)
        .single()

      setChild(child)
      setBitcoinAddress(child?.bitcoin_address || '')

      if (child?.family_id) {
        const { data: chores } = await supabase
          .from('chores')
          .select('*')
          .eq('family_id', child.family_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        setChores(chores || [])

        const { data: completions } = await supabase
          .from('completions')
          .select('*')
          .eq('child_id', childId)

        setCompletions(completions || [])
      }

      setLoading(false)
    }
    getData()
  }, [childId])

  const handleSaveAddress = async () => {
    setSavingAddress(true)
    const { error } = await supabase
      .from('profiles')
      .update({ bitcoin_address: bitcoinAddress })
      .eq('id', childId)

    if (!error) {
      setAddressSaved(true)
      setEditingAddress(false)
      setChild((prev: any) => ({ ...prev, bitcoin_address: bitcoinAddress }))
      setTimeout(() => setAddressSaved(false), 3000)
    }
    setSavingAddress(false)
  }

  const handleDone = async (chore: any) => {
    setTapping(chore.id)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const existing = completions.find(
        c => c.chore_id === chore.id && c.status === 'pending'
      )
      if (existing) {
        setTapping(null)
        return
      }

      const { error } = await supabase
        .from('completions')
        .insert({
          chore_id: chore.id,
          child_id: childId,
          family_id: chore.family_id,
          status: 'pending'
        })

      if (error) throw error

      const { data: newCompletions } = await supabase
        .from('completions')
        .select('*')
        .eq('child_id', childId)

      setCompletions(newCompletions || [])
    } catch (err) {
      console.error(err)
    }

    setTapping(null)
  }

  const getChoreStatus = (choreId: string) => {
    const completion = completions.find(c => c.chore_id === choreId)
    if (!completion) return 'open'
    return completion.status
  }

  const getTotalEarned = () => {
    const paidCompletions = completions.filter(c => c.status === 'paid')
    return paidCompletions.reduce((total, c) => {
      const chore = chores.find(ch => ch.id === c.chore_id)
      return total + (chore?.sats_value || 0)
    }, 0)
  }

  const getPendingEarned = () => {
    const pendingCompletions = completions.filter(c => c.status === 'pending')
    return pendingCompletions.reduce((total, c) => {
      const chore = chores.find(ch => ch.id === c.chore_id)
      return total + (chore?.sats_value || 0)
    }, 0)
  }

  const getChoreEmoji = (type: string) => {
    if (type === 'learning') return '🎓'
    if (type === 'task') return '✅'
    return '🧹'
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
      <div className="bg-[#161B22] border-b border-white/7 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#7A8494] text-sm font-bold">👀 Viewing as</span>
          <span className="text-white text-sm font-black">{child?.name}</span>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="text-[#F7931A] text-sm font-black hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
        >
          Exit to Dashboard
        </button>
      </div>

      <nav className="bg-gradient-to-r from-[#E06B00] to-[#F7931A] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
              Hey there!
            </div>
            <div className="text-white font-black text-3xl" style={{fontFamily: 'Nunito, sans-serif'}}>
              {child?.name} ⚡
            </div>
          </div>
          <div className="text-5xl">
            {child?.avatar_emoji || '🧒'}
          </div>
        </div>
      </nav>

      <div className="px-6 -mt-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-xl">
          <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-1">
            Sats Earned
          </div>
          <div className="text-[#080B10] font-black text-4xl mb-1" style={{fontFamily: 'Nunito, sans-serif'}}>
            {getTotalEarned().toLocaleString()}
            <span className="text-[#F7931A] text-xl ml-2">sats</span>
          </div>
          {getPendingEarned() > 0 && (
            <div className="text-sm font-semibold text-[#7A8494]">
              + <span className="text-[#F7931A] font-bold">{getPendingEarned().toLocaleString()} sats</span> waiting for approval
            </div>
          )}
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">₿</span>
              <div>
                <div className="text-white font-black text-sm">Bitcoin Address</div>
                <div className="text-[#7A8494] text-xs font-semibold">Where sats get sent</div>
              </div>
            </div>
            {!editingAddress && (
              <button
                onClick={() => setEditingAddress(true)}
                className="text-[#F7931A] text-xs font-black hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
              >
                {child?.bitcoin_address ? 'Edit' : '+ Add'}
              </button>
            )}
          </div>

          {editingAddress ? (
            <div className="space-y-3">
              <input
                type="text"
                value={bitcoinAddress}
                onChange={e => setBitcoinAddress(e.target.value)}
                placeholder="bc1q... or lightning address"
                className="w-full bg-[#080B10] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors font-mono text-xs"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingAddress(false); setBitcoinAddress(child?.bitcoin_address || '') }}
                  className="flex-1 bg-[#161B22] border border-white/7 text-white font-bold py-2 rounded-xl text-sm hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                  className="flex-1 bg-gradient-to-r from-[#FFB347] to-[#F7931A] text-white font-black py-2 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {savingAddress ? '...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {child?.bitcoin_address ? (
                <div className="text-[#7A8494] text-xs font-mono break-all">
                  {child.bitcoin_address}
                </div>
              ) : (
                <div className="text-[#7A8494] text-xs font-semibold">
                  No address set yet — tap + Add to set one
                </div>
              )}
              {addressSaved && (
                <div className="text-green-400 text-xs font-bold mt-2">
                  Address saved!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-10">
        <h2 className="text-white font-black text-xl mb-4" style={{fontFamily: 'Nunito, sans-serif'}}>
          My Chores
        </h2>

        {chores.length === 0 ? (
          <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-10 text-center">
            <div className="text-5xl mb-3">😴</div>
            <div className="text-white font-black text-xl mb-2" style={{fontFamily: 'Nunito, sans-serif'}}>
              No chores yet!
            </div>
            <div className="text-[#7A8494] font-semibold text-sm">
              Ask your parent to add some chores.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {chores.map(chore => {
              const status = getChoreStatus(chore.id)
              const isPending = status === 'pending'
              const isPaid = status === 'paid'
              const isOpen = status === 'open'

              return (
                <div
                  key={chore.id}
                  className={`rounded-2xl p-5 border-2 transition-all ${
                    isPaid
                      ? 'bg-[#0F1318] border-green-500/30 opacity-60'
                      : isPending
                      ? 'bg-[#0F1318] border-[#F7931A]/40'
                      : 'bg-[#0F1318] border-white/7'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                      isPaid ? 'bg-green-500/10' :
                      isPending ? 'bg-[#F7931A]/10' :
                      'bg-[#F7931A]/10'
                    }`}>
                      {isPaid ? '✅' : getChoreEmoji(chore.chore_type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-black text-base mb-1">
                        {chore.title}
                      </div>
                      {chore.description && (
                        <div className="text-[#7A8494] text-sm font-semibold mb-1">
                          {chore.description}
                        </div>
                      )}
                      {chore.youtube_url && (
                        <button
                          onClick={() => window.open(chore.youtube_url, '_blank')}
                          className="text-[#3AADFF] text-sm font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
                        >
                          Watch Video
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-[#F7931A] font-black text-lg" style={{fontFamily: 'Nunito, sans-serif'}}>
                        {chore.sats_value.toLocaleString()} sats
                      </div>
                      {isOpen && (
                        <button
                          onClick={() => handleDone(chore)}
                          disabled={tapping === chore.id}
                          className="bg-gradient-to-r from-[#FFB347] to-[#F7931A] text-white font-black px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                        >
                          {tapping === chore.id ? '...' : 'Done!'}
                        </button>
                      )}
                      {isPending && (
                        <div className="bg-[#F7931A]/15 border border-[#F7931A]/30 text-[#FFB347] text-xs font-bold px-3 py-1.5 rounded-xl">
                          Waiting
                        </div>
                      )}
                      {isPaid && (
                        <div className="bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                          Paid!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
