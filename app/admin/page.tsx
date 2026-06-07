'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Traveler = {
  id: string
  email: string
  full_name: string
  status: string
  created_at: string
  trip_date: string | null
  invite_used: boolean
}

type Invite = {
  id: string
  email: string
  token: string
  used: boolean
  created_at: string
  expires_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'travelers' | 'invites' | 'new'>('travelers')
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [sending, setSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedToken, setCopiedToken] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/dashboard'); return }

    fetchData()
  }

  async function fetchData() {
    setLoading(true)
    const [{ data: t }, { data: i }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('invites').select('*').order('created_at', { ascending: false }),
    ])
    setTravelers(t || [])
    setInvites(i || [])
    setLoading(false)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setSuccessMsg('')

    const res = await fetch('/api/invite/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, full_name: newName }),
    })

    const result = await res.json()
    if (res.ok) {
      setSuccessMsg(`✅ تم إرسال رابط الدعوة إلى ${newEmail}`)
      setNewEmail('')
      setNewName('')
      fetchData()
    } else {
      setSuccessMsg(`❌ خطأ: ${result.error}`)
    }
    setSending(false)
  }

  async function disableTraveler(id: string) {
    await supabase.from('profiles').update({ status: 'disabled' }).eq('id', id)
    fetchData()
  }

  async function enableTraveler(id: string) {
    await supabase.from('profiles').update({ status: 'active' }).eq('id', id)
    fetchData()
  }

  async function deleteTraveler(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المسافر؟')) return
    await fetch('/api/travelers/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}/register?token=${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(''), 2000)
  }

  const filteredTravelers = travelers.filter(t =>
    t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: travelers.length,
    active: travelers.filter(t => t.status === 'active').length,
    pending: invites.filter(i => !i.used).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🇨🇳</span>
          <div>
            <div className="font-medium text-sm">لوحة المدير</div>
            <div className="text-xs opacity-75">China Travel Portal</div>
          </div>
        </div>
        <button onClick={() => { supabase.auth.signOut(); router.push('/') }}
          className="text-xs bg-white/20 px-3 py-1.5 rounded-full">خروج</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { label: 'إجمالي المسافرين', value: stats.total, color: 'text-blue-600' },
          { label: 'نشطون', value: stats.active, color: 'text-green-600' },
          { label: 'دعوات معلقة', value: stats.pending, color: 'text-yellow-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 flex mx-4 rounded-xl overflow-hidden mb-4">
        {[
          { id: 'travelers', label: 'المسافرون' },
          { id: 'invites', label: 'الدعوات' },
          { id: 'new', label: '+ دعوة جديدة' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === t.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">

        {/* TRAVELERS */}
        {activeTab === 'travelers' && (
          <div>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍 بحث بالاسم أو الإيميل..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-red-500"
            />
            {loading ? <p className="text-center text-gray-400 py-8">جاري التحميل...</p> : (
              <div className="space-y-2">
                {filteredTravelers.map(t => (
                  <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{t.full_name || 'بدون اسم'}</div>
                        <div className="text-xs text-gray-500 truncate">{t.email}</div>
                        {t.trip_date && <div className="text-xs text-blue-600 mt-0.5">✈️ {t.trip_date}</div>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${t.status === 'active' ? 'bg-green-100 text-green-700' : t.status === 'disabled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {t.status === 'active' ? 'نشط' : t.status === 'disabled' ? 'معطل' : 'معلق'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {t.status === 'active' ? (
                        <button onClick={() => disableTraveler(t.id)} className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg flex-1">
                          تعطيل
                        </button>
                      ) : (
                        <button onClick={() => enableTraveler(t.id)} className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg flex-1">
                          تفعيل
                        </button>
                      )}
                      <button onClick={() => deleteTraveler(t.id)} className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg flex-1">
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
                {filteredTravelers.length === 0 && (
                  <p className="text-center text-gray-400 py-8">لا توجد نتائج</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* INVITES */}
        {activeTab === 'invites' && (
          <div className="space-y-2">
            {invites.map(inv => (
              <div key={inv.id} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{inv.email}</div>
                    <div className="text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString('ar-EG')}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.used ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                    {inv.used ? 'مستخدم' : 'فعّال'}
                  </span>
                </div>
                {!inv.used && (
                  <button onClick={() => copyInviteLink(inv.token)}
                    className="w-full mt-2 text-xs bg-blue-50 text-blue-700 py-1.5 rounded-lg font-medium">
                    {copiedToken === inv.token ? '✅ تم النسخ!' : '📋 نسخ الرابط'}
                  </button>
                )}
              </div>
            ))}
            {invites.length === 0 && <p className="text-center text-gray-400 py-8">لا توجد دعوات</p>}
          </div>
        )}

        {/* NEW INVITE */}
        {activeTab === 'new' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">إرسال دعوة جديدة</h2>
            <form onSubmit={sendInvite} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">الاسم الكامل</label>
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="محمد أحمد" required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">البريد الإلكتروني</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="traveler@email.com" required dir="ltr"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
              </div>
              {successMsg && (
                <p className={`text-sm rounded-lg px-3 py-2 ${successMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {successMsg}
                </p>
              )}
              <button type="submit" disabled={sending}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg py-3 text-sm font-medium transition-colors">
                {sending ? 'جاري الإرسال...' : '📨 إرسال رابط الدعوة'}
              </button>
            </form>
            <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              سيصل إيميل تلقائي للمسافر يحتوي على رابط تسجيل فردي صالح لمرة واحدة فقط لمدة 7 أيام
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
