'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreateChorePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [satsValue, setSatsValue] = useState('')
  const [frequency, setFrequency] = useState<'one-time' | 'daily' | 'weekly' | 'monthly'>('weekly')
  const [choreType, setChoreType] = useState<'chore' | 'task' | 'learning'>('chore')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get family
      const { data: family } = await supabase
        .from('families')
        .select('id')
        .eq('parent_id', user.id)
        .single()

      if (!family) throw new Error('No family found. Please add a child first.')

      const { error: choreError } = await supabase
        .from('chores')
        .insert({
          family_id: family.id,
          title,
          description,
          sats_value: parseInt(satsValue),
          frequency,
          chore_type: choreType,
          youtube_url: choreType === 'learning' ? youtubeUrl : null,
          is_active: true
        })

      if (choreError) throw choreError

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
            Create a Task ⚡
          </h1>
          <p className="text-[#7A8494] font-semibold">
            Set up a chore, task or learning assignment with a sat reward.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Task Type */}
          <div>
            <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-3">
              Task Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'chore', label: 'Chore', emoji: '🧹', desc: 'Household task' },
                { value: 'task', label: 'Task', emoji: '✅', desc: 'One-off job' },
                { value: 'learning', label: 'Learning', emoji: '🎓', desc: 'Watch & earn' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setChoreType(option.value as any)}
                  className={`py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                    choreType === option.value
                      ? 'border-[#F7931A] bg-[#F7931A]/10 text-[#FFB347]'
                      : 'border-white/7 text-[#7A8494] hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span>{option.label}</span>
                  <span className="text-xs opacity-70">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                choreType === 'chore' ? 'Take out the trash' :
                choreType === 'task' ? 'Clean the garage' :
                'Watch: What is Bitcoin?'
              }
              required
              className="w-full bg-[#0F1318] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
              Description <span className="normal-case text-[#7A8494] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Any extra details about what needs to be done..."
              rows={3}
              className="w-full bg-[#0F1318] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors resize-none"
            />
          </div>

          {/* YouTube URL - only for learning */}
          {choreType === 'learning' && (
            <div>
              <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
                YouTube Link
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-[#0F1318] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors"
              />
            </div>
          )}

          {/* Sats Value */}
          <div>
            <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-2">
              Commission (sats)
            </label>
            <div className="relative">
              <input
                type="number"
                value={satsValue}
                onChange={e => setSatsValue(e.target.value)}
                placeholder="500"
                required
                min="1"
                className="w-full bg-[#0F1318] border border-white/7 rounded-xl px-4 py-3 text-white placeholder-[#7A8494] focus:outline-none focus:border-[#F7931A]/50 transition-colors pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F7931A] font-bold text-sm">
                sats
              </span>
            </div>
            {satsValue && (
              <p className="text-[#7A8494] text-xs mt-1 font-semibold">
                ≈ ${(parseInt(satsValue) * 0.00072749).toFixed(4)} USD
              </p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-bold text-[#7A8494] uppercase tracking-wider mb-3">
              Frequency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'one-time', label: 'One Time', emoji: '⭐' },
                { value: 'daily', label: 'Daily', emoji: '📅' },
                { value: 'weekly', label: 'Weekly', emoji: '📆' },
                { value: 'monthly', label: 'Monthly', emoji: '🗓️' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFrequency(option.value as any)}
                  className={`py-3 rounded-xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                    frequency === option.value
                      ? 'border-[#F7931A] bg-[#F7931A]/10 text-[#FFB347]'
                      : 'border-white/7 text-[#7A8494] hover:border-white/20'
                  }`}
                >
                  <span className="text-lg">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
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
            {loading ? 'Creating...' : 'Create Task ⚡'}
          </button>
        </form>
      </div>
    </div>
  )
}