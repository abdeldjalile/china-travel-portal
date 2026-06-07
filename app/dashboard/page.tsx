'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TABS = [
  { id: 'guide', label: 'الدليل التجاري', icon: '🗺️' },
  { id: 'apps', label: 'التطبيقات', icon: '📱' },
  { id: 'emergency', label: 'معلومات مهمة', icon: '⚠️' },
]

const MARKETS = [
  { name: 'Canton Fair Complex', sub: 'Pazhou, Guangzhou', tag: 'رقم 1 عالمياً', icon: '🏭' },
  { name: 'سوق يوا للجملة', sub: 'Yiwu International Trade', tag: 'أكبر بالعالم', icon: '🏪' },
  { name: 'هواكيانبي للإلكترونيات', sub: 'Shenzhen', tag: 'تكنولوجيا', icon: '💻' },
  { name: 'سوق زهانباو', sub: 'ملابس · قوانغتشو', tag: 'ملابس', icon: '👔' },
  { name: 'سوق كسي تشنغ', sub: 'مجوهرات وأحجار', tag: 'جملة', icon: '💎' },
  { name: 'لونغ فو سي', sub: 'مواد البناء', tag: 'مواد', icon: '🏗️' },
]

const RESTAURANTS = [
  { name: 'Guangzhou Restaurant', addr: '文昌南路2号 — كانتوني أصيل', badge: 'حلال متاح', color: 'bg-green-100 text-green-800' },
  { name: 'مطعم الهلال الذهبي', addr: 'Tianhe District', badge: 'حلال 100%', color: 'bg-green-100 text-green-800' },
  { name: 'Baiyun International', addr: 'قرب Canton Fair', badge: 'متنوع', color: 'bg-blue-100 text-blue-800' },
]

const HOTELS = [
  { name: 'China Hotel Guangzhou', addr: 'Marriott — قريب من المركز', badge: '5 نجوم' },
  { name: 'Pazhou Hotel', addr: 'داخل مجمع Canton Fair', badge: 'الأقرب' },
  { name: 'Guangzhou Marriott', addr: 'Tianhe CBD', badge: '5 نجوم' },
]

const APPS = [
  { name: 'WeChat', desc: 'تواصل · دفع · كل شيء', icon: '💬', bg: 'bg-green-500', required: true, android: 'https://play.google.com/store/apps/details?id=com.tencent.mm', ios: 'https://apps.apple.com/app/wechat/id414478124' },
  { name: 'Alipay', desc: 'دفع إلكتروني', icon: '💳', bg: 'bg-blue-500', required: true, android: 'https://play.google.com/store/apps/details?id=com.eg.android.AlipayGphone', ios: 'https://apps.apple.com/app/alipay/id333206289' },
  { name: 'Baidu Maps', desc: 'خرائط دقيقة داخل الصين', icon: '🗺️', bg: 'bg-blue-600', required: false, android: 'https://play.google.com/store/apps/details?id=com.baidu.BaiduMap', ios: 'https://apps.apple.com/app/baidu-maps/id452186370' },
  { name: 'Baidu Translate', desc: 'ترجمة فورية بالكاميرا', icon: '🔤', bg: 'bg-orange-500', required: false, android: 'https://play.google.com/store/apps/details?id=com.baidu.translate', ios: 'https://apps.apple.com/app/baidu-translate/id538289028' },
  { name: 'DiDi Chuxing', desc: 'تاكسي وسيارات خاصة', icon: '🚕', bg: 'bg-red-500', required: false, android: 'https://play.google.com/store/apps/details?id=com.sdu.didi.psnger', ios: 'https://apps.apple.com/app/didi/id554499054' },
  { name: 'ExpressVPN', desc: 'للوصول لـ Google وWhatsApp', icon: '🛡️', bg: 'bg-indigo-600', required: true, android: 'https://play.google.com/store/apps/details?id=com.expressvpn.vpn', ios: 'https://apps.apple.com/app/expressvpn/id886492891' },
  { name: '1688.com', desc: 'جملة من المصانع مباشرة', icon: '🏭', bg: 'bg-orange-600', required: false, android: 'https://play.google.com/store/apps/details?id=com.alibaba.intl.android.apps.poseidon', ios: 'https://apps.apple.com/app/1688/id480684416' },
  { name: 'Canton Fair App', desc: 'الدليل الرسمي للمعرض', icon: '🎪', bg: 'bg-red-700', required: true, android: 'https://play.google.com/store/search?q=canton+fair', ios: 'https://apps.apple.com/search?term=canton+fair' },
]

export default function DashboardPage() {
  const [tab, setTab] = useState('guide')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/'); return }
      setUser(data.user)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇨🇳</span>
          <div>
            <div className="font-medium text-sm">بوابة المسافر — الصين</div>
            <div className="text-xs opacity-75">Canton Fair · Guangzhou</div>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
          خروج
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 flex sticky top-14 z-10">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-medium transition-colors border-b-2 ${tab === t.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'}`}>
            <span className="block text-base mb-0.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-2xl mx-auto">

        {/* GUIDE TAB */}
        {tab === 'guide' && (
          <div className="space-y-6">
            <Section title="المراكز التجارية — Canton Fair">
              <div className="grid grid-cols-2 gap-3">
                {MARKETS.map(m => (
                  <div key={m.name} className="bg-white rounded-xl border border-gray-100 p-3">
                    <div className="text-2xl mb-2 text-red-600">{m.icon}</div>
                    <div className="text-sm font-medium text-gray-800">{m.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.sub}</div>
                    <span className="inline-block mt-2 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">{m.tag}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="المطاعم الموصى بها">
              <div className="space-y-2">
                {RESTAURANTS.map(r => (
                  <div key={r.name} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                    <span className="text-2xl text-red-600">🍽️</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{r.name}</div>
                      <div className="text-xs text-gray-500">{r.addr}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.color}`}>{r.badge}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="الفنادق الموصى بها">
              <div className="space-y-2">
                {HOTELS.map(h => (
                  <div key={h.name} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                    <span className="text-2xl text-red-600">🏨</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{h.name}</div>
                      <div className="text-xs text-gray-500">{h.addr}</div>
                    </div>
                    <span className="text-xs bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-full">{h.badge}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* APPS TAB */}
        {tab === 'apps' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
              ⚠️ حمّل هذه التطبيقات <strong>قبل السفر</strong> وفعّلها في بلدك
            </div>
            <div className="grid grid-cols-2 gap-3">
              {APPS.map(app => (
                <div key={app.name} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <div className={`w-12 h-12 ${app.bg} rounded-xl flex items-center justify-center text-2xl mx-auto mb-2`}>
                    {app.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-800">{app.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 mb-2">{app.desc}</div>
                  {app.required && (
                    <span className="inline-block text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full mb-2">ضروري</span>
                  )}
                  <div className="flex gap-1 justify-center">
                    <a href={app.android} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg hover:bg-green-100">
                      🤖 Android
                    </a>
                    <a href={app.ios} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100">
                       iOS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMERGENCY TAB */}
        {tab === 'emergency' && (
          <div className="space-y-4">
            <Section title="أرقام الطوارئ في الصين">
              <div className="grid grid-cols-2 gap-3">
                {[['🚑','إسعاف','120'],['🚔','شرطة','110'],['🚒','حرائق','119'],['📞','سياحة','12301']].map(([icon,label,num]) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-xl font-semibold text-gray-800">{num}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="تنبيهات مهمة">
              <div className="space-y-2">
                <InfoBox color="yellow" text="Google وYouTube وWhatsApp محجوبة في الصين — حمّل VPN قبل السفر ولا تحاول تنزيله داخل البلاد" />
                <InfoBox color="blue" text="Visa وMastercard مقبولتان في الفنادق الكبرى فقط — احمل نقداً (Yuan/RMB) للأسواق والمطاعم" />
                <InfoBox color="green" text="احتفظ بصورة من جواز سفرك في هاتفك — تأشيرة العمل تختلف عن السياحية" />
              </div>
            </Section>

            <Section title="تواصل مع الوكالة">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-xl">🎧</div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">دعم الوكالة — 24/7</div>
                    <div className="text-xs text-gray-500">WhatsApp · WeChat · هاتف مباشر</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="https://wa.me/YOUR_NUMBER" className="flex-1 text-center text-xs bg-green-50 text-green-700 py-2 rounded-lg font-medium">
                    💬 WhatsApp
                  </a>
                  <a href="#" className="flex-1 text-center text-xs bg-blue-50 text-blue-700 py-2 rounded-lg font-medium">
                    💬 WeChat
                  </a>
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">{title}</p>
      {children}
    </div>
  )
}

function InfoBox({ color, text }: { color: string; text: string }) {
  const styles: any = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
  }
  return (
    <div className={`border rounded-xl p-3 text-xs leading-relaxed ${styles[color]}`}>
      {text}
    </div>
  )
}
