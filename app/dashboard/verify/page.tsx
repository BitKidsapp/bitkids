'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function VerifyPage() {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data: family } = await supabase
        .from('families')
        .select('id')
        .eq('parent_id', user.id)
        .single()

      if (!family) { setLoading(false); return }

      const { data: completions } = await supabase
        .from('completions')
        .select(`
          *,
          chore:chores(*),
          child:profiles!completions_child_id_fkey(*)
        `)
        .eq('family_id', family.id)
        .eq('status', 'pending')
        .order('completed_at', { ascending: false })

      setPending(completions || [])
      setLoading(false)
    }
    getData()
  }, [])

  const handleApprove = async (completion: any) => {
    setActing(completion.id)
    const { error } = await supabase
      .from('completions')
      .update({
        status: 'paid',
        verified_at: new Date().toISOString(),
        paid_at: new Date().toISOString()
      })
      .eq('id', completion.id)

    if (!error) {
      setPending(prev => prev.filter(c => c.id !== completion.id))
    }
    setActing(null)
  }

  const handleReject = async (completion: any) => {
    setActing(completion.id)
    const { error } = await supabase
      .from('completions')
      .update({ status: 'rejected' })
      .eq('id', completion.id)

    if (!error) {
      setPending(prev => prev.filter(c => c.id !== completion.id))
    }
    setActing(null)
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
            Review & Approve ✅
          </h1>
          <p className="text-[#7A8494] font-semibold">
            {pending.length === 0
              ? 'No pending completions right now.'
              : `${pending.length} task${pending.length > 1 ? 's' : ''} waiting for your review.`}
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="bg-[#0F1318] border border-white/7 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-white font-black text-xl mb-2" style={{fontFamily: 'Nunito, sans-serif'}}>
              All caught up!
            </div>
            <div className="text-[#7A8494] font-semibold text-sm">
              No tasks waiting for review.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(completion => (
              <div key={completion.id} className="bg-[#0F1318] border border-[#F7931A]/30 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 flex items-center justify-center text-2xl flex-shrink-0">
                    🧹
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-black text-lg mb-1">
                      {completion.chore?.title}
                    </div>
                    <div className="text-[#7A8494] text-sm font-semibold mb-1">
                      Completed by <span className="text-white font-bold">{completion.child?.name}</span>
                    </div>
                    <div className="text-[#F7931A] font-black text-base">
                      {completion.chore?.sats_value?.toLocaleString()} sats
                    </div>
                  </div>
                </div>

                <div className="bg-[#080B10] rounded-xl p-4 mb-5">
                  <div className="text-[#7A8494] text-xs font-bold uppercase tracking-wider mb-2">
                    Send sats to
                  </div>
                  <div className="text-[#7A8494] text-xs font-mono">
                    No wallet address set yet
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleReject(completion)}
                    disabled={acting === completion.id}
                    className="bg-[#161B22] border border-white/7 text-white font-black py-3 rounded-xl hover:border-red-500/40 transition-colors disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                  <button
                    onClick={() => handleApprove(completion)}
                    disabled={acting === completion.id}
                    className="bg-gradient-to-r from-[#FFB347] to-[#F7931A] text-white font-black py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {acting === completion.id ? '...' : '✓ Approve & Pay'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}