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
  const [allCompletions, setAllCompletions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tapping, setTapping] = useState<string | null>(null)
  const [editingAddress, setEditingAddress] = useState(false)
  const [bitcoinAddress, setBitcoinAddress] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressSaved, setAddressSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'chores' | 'history'>('chores')

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
          .order('completed_at', { ascending: false })

        setCompletions(completions || [])

        const { data: allComp } = await supabase
          .from('completions')
          .select('*, chore:chores(*)')
          .eq('child_id', childId)
          .order('completed_at', { ascending: false })

        setAllCompletions(allComp || [])
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
        .order('completed_at', { ascending: false })

      setCompletions(newCompletions || [])

      const { data: allComp } = await supabase
        .from('completions')
        .select('*, chore:chores(*)')
        .eq('child_id', childId)
        .order('completed_at', { ascending: false })

      setAllCompletions(allComp || [])
    } catch (err) {
      console.error(err)
    }

    setTapping(null)
  }

  // Returns 'open' | 'pending' | 'paid' | 'hidden'
  // 'hidden' means the chore should not appear in My Chores tab
  const getChoreStatus = (chore: any): string => {
    const choreCompletions = completions
      .filter(c => c.chore_id === chore.id)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())

    const latest = choreCompletions[0]

    // Never been done — always show as open
    if (!latest) return 'open'

    // Currently pending — always show
    if (latest.status === 'pending') return 'pending'

    // One-time chore that's paid — hide from My Chores (goes to History only)
    if (chore.frequency === 'one-time' && latest.status === 'paid') return 'hidden'

    // Recurring chore that's paid — check if enough time has passed
    if (latest.status === 'paid') {
      const paidAt = new Date(latest.paid_at || latest.completed_at)
      const now = new Date()
      const diffMs = now.getTime() - paidAt.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      if (chore.frequency === 'daily' && diffDays < 1) return 'hidden'
      if (chore.frequency === 'weekly' && diffDays < 7) return 'hidden'
      if (chore.frequency === 'monthly' && diffDays < 30) return 'hidden'

      // Enough time has passed — show as open again
      return 'open'
    }

    return latest.status
  }

  const getTotalEarned = () => {
    return allCompletions
      .filter(c => c.status === 'paid')
      .reduce((total, c) => total + (c.chore?.sats_value || 0), 0)
  }

  const getPendingEarned = () => {
    return allCompletions
      .filter(c => c.status === 'pending')
      .reduce((total, c) => total + (c.chore?.sats_value || 0), 0)
  }

  const getChoreEmoji = (type: string) => {
    if (type === 'learning') return '🎓'
    if (type === 'task') return '✅'
    return '🧹'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    if (status === 'paid') return { label: 'Paid', color: 'text-green-400 bg-green-500/15 border-green-500/30' }
    if (status === 'pending') return { label: 'Waiting', color: 'text-[#FFB347] bg-[#F7931A]/15 border-[#F7931A]/30' }
    if (status === 'rejected') return { label: 'Rejected', color: 'text-red-400 bg-red-500/15 border-red-500/30' }
    return { label: status, color: 'text-[#7A8494] bg-white/5 border-white/10' }
  }

  // Only show chores that are not hidden
  const visibleChores = chores.filter(chore => getChoreStatus(chore) !== 'hidden')

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

      <div className="px-6 mb-4">
        <div className="flex bg-[#0F1318] border border-white/7 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('chores')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'chores'
                ? 'bg-[#F7931A] text-white'
                : 'text-[#7A8494] hover:text-white'
            }`}
          >
            My Chores {visibleChores.length > 0 && `(${visibleChores.length})`}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-[#F7931A] text-white'
                : 'text-[#7A8494] hover:text-white'
            }`}
          >
            History {allCompletions.length > 0 && `(${allCompletions.length})`}
          </button>
        </div>
      </div>

      {activeTab === 'chores' && (
        <div className="px-6 pb-10">
          {visibleChores.length === 0 ? (
            <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <div className="text-white font-black text-xl mb-2" style={{fontFamily: 'Nunito, sans-serif'}}>
                All done!
              </div>
              <div className="text-[#7A8494] font-semibold text-sm">
                No chores to do right now. Check back later!
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleChores.map(chore => {
                const status = getChoreStatus(chore)
                const isPending = status === 'pending'
                const isPaid = status === 'paid'
                const isOpen = status === 'open'

                return (
                  <div
                    key={chore.id}
                    className={`rounded-2xl p-5 border-2 transition-all ${
                      isPending
                        ? 'bg-[#0F1318] border-[#F7931A]/40'
                        : 'bg-[#0F1318] border-white/7'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                        isPending ? 'bg-[#F7931A]/10' : 'bg-[#F7931A]/10'
                      }`}>
                        {getChoreEmoji(chore.chore_type)}
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
                        <div className="text-[#7A8494] text-xs font-semibold capitalize">
                          {chore.frequency === 'one-time' ? 'One time' : chore.frequency}
                        </div>
                        {chore.youtube_url && (
                          <button
                            onClick={() => window.open(chore.youtube_url, '_blank')}
                            className="text-[#3AADFF] text-sm font-bold hover:underline bg-transparent border-none cursor-pointer p-0 mt-1"
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
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="px-6 pb-10">
          {allCompletions.length === 0 ? (
            <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-3">📋</div>
              <div className="text-white font-black text-xl mb-2" style={{fontFamily: 'Nunito, sans-serif'}}>
                No history yet!
              </div>
              <div className="text-[#7A8494] font-semibold text-sm">
                Complete some chores to see your history here.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {allCompletions.map(completion => {
                const badge = getStatusBadge(completion.status)
                return (
                  <div key={completion.id} className="bg-[#0F1318] border border-white/7 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 flex items-center justify-center text-2xl flex-shrink-0">
                        {getChoreEmoji(completion.chore?.chore_type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-black text-base mb-1">
                          {completion.chore?.title}
                        </div>
                        <div className="text-[#7A8494] text-xs font-semibold">
                          {formatDate(completion.completed_at)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-[#F7931A] font-black text-base" style={{fontFamily: 'Nunito, sans-serif'}}>
                          {completion.chore?.sats_value?.toLocaleString()} sats
                        </div>
                        <div className={`text-xs font-bold px-3 py-1 rounded-xl border ${badge.color}`}>
                          {badge.label}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
