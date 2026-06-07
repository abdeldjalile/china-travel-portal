'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [step, setStep] = useState<'loading' | 'valid' | 'invalid' | 'used' | 'success'>('loading')
  const [invite, setInvite] = useState<any>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setStep('invalid'); return }
    checkToken()
  }, [token])

  async function checkToken() {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !data) { setStep('invalid'); return }
    if (data.used) { setStep('used'); return }
    if (new Date(data.expires_at) < new Date()) { setStep('invalid'); return }

    setInvite(data)
    setStep('valid')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('كلمات المرور غير متطابقة'); return }
    if (password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password, email: invite.email }),
    })

    const result = await res.json()
    if (!res.ok) { setError(result.error || 'حدث خطأ'); setLoading(false); return }

    setStep('success')
  }

  if (step === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">جاري التحقق من الرابط...</p>
    </div>
  )

  if (step === 'invalid') return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">رابط غير صالح أو منتهي</h2>
        <p className="text-sm text-gray-500">تواصل مع الوكالة للحصول على رابط جديد</p>
      </div>
    </div>
  )

  if (step === 'used') return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">هذا الرابط تم استخدامه مسبقاً</h2>
        <p className="text-sm text-gray-500 mb-4">كل رابط يُستخدم مرة واحدة فقط</p>
        <a href="/" className="text-red-600 text-sm underline">تسجيل الدخول بحسابك</a>
      </div>
    </div>
  )

  if (step === 'success') return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">تم إنشاء حسابك بنجاح!</h2>
        <p className="text-sm text-gray-500 mb-6">يمكنك الآن الدخول إلى المنصة</p>
        <a href="/" className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
          تسجيل الدخول الآن
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🇨🇳</div>
          <h1 className="text-lg font-semibold text-gray-800">إنشاء حسابك</h1>
          <p className="text-sm text-gray-500 mt-1">{invite?.email}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8 أحرف على الأقل"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="أعد كتابة كلمة المرور"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>
      </div>
    </div>
  )
}
