# 🇨🇳 دليل نشر بوابة المسافر — خطوة بخطوة

---

## المرحلة 1 — إعداد Supabase (قاعدة البيانات)

### الخطوة 1.1 — إنشاء الحساب
1. اذهب إلى https://supabase.com
2. اضغط "Start your project" → سجّل بـ GitHub أو Google
3. اضغط "New Project"
4. أدخل اسم المشروع: `china-travel-portal`
5. اختر كلمة مرور قوية للقاعدة (احفظها)
6. اختر المنطقة الأقرب (Europe أو Asia)
7. اضغط "Create new project" وانتظر ~2 دقيقة

### الخطوة 1.2 — إنشاء الجداول
1. في القائمة الجانبية اضغط **SQL Editor**
2. افتح ملف `supabase-schema.sql` من المشروع
3. انسخ المحتوى كاملاً والصقه في المحرر
4. اضغط **Run** (الزر الأخضر)
5. يجب أن ترى: "Success. No rows returned"

### الخطوة 1.3 — الحصول على مفاتيح API
1. اضغط **Settings** (الترس) → **API**
2. انسخ **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. انسخ **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. انسخ **service_role** (اضغط Reveal) → `SUPABASE_SERVICE_ROLE_KEY`

---

## المرحلة 2 — إعداد Resend (إرسال الإيميلات)

### الخطوة 2.1
1. اذهب إلى https://resend.com → سجّل مجاناً
2. اضغط **API Keys** → **Create API Key**
3. انسخ المفتاح → `RESEND_API_KEY`

### الخطوة 2.2 — التحقق من النطاق (اختياري للبداية)
- في البداية يمكنك الإرسال من `onboarding@resend.dev`
- لاحقاً أضف نطاقك الخاص من **Domains**

---

## المرحلة 3 — رفع الكود على GitHub

### الخطوة 3.1
1. اذهب إلى https://github.com → أنشئ حساباً إذا لم يكن لديك
2. اضغط **New repository**
3. اسم المستودع: `china-travel-portal`
4. اختر **Private** (خاص)
5. اضغط **Create repository**

### الخطوة 3.2 — رفع الملفات
1. حمّل ملف المشروع المضغوط من هذه المحادثة
2. في GitHub اضغط **uploading an existing file**
3. اسحب جميع الملفات وأفلتها
4. اضغط **Commit changes**

---

## المرحلة 4 — النشر على Vercel

### الخطوة 4.1
1. اذهب إلى https://vercel.com → سجّل بـ GitHub
2. اضغط **Add New Project**
3. اختر مستودع `china-travel-portal`
4. اضغط **Import**

### الخطوة 4.2 — إضافة متغيرات البيئة
قبل الضغط على Deploy، اضغط **Environment Variables** وأضف:

| الاسم | القيمة |
|-------|--------|
| NEXT_PUBLIC_SUPABASE_URL | من الخطوة 1.3 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | من الخطوة 1.3 |
| SUPABASE_SERVICE_ROLE_KEY | من الخطوة 1.3 |
| RESEND_API_KEY | من الخطوة 2.1 |
| NEXT_PUBLIC_BASE_URL | https://your-project.vercel.app |
| FROM_EMAIL | onboarding@resend.dev |

### الخطوة 4.3
1. اضغط **Deploy**
2. انتظر ~3 دقائق
3. ستحصل على رابط مثل: `https://china-travel-portal.vercel.app`

---

## المرحلة 5 — إنشاء حساب المدير

### الخطوة 5.1
1. افتح رابط موقعك
2. سجّل دخول بإيميل وكلمة مرور تختارها أنت
   - ملاحظة: أول مرة لن يعمل الدخول لأن الحساب غير موجود
3. اذهب إلى Supabase → **Authentication** → **Users**
4. اضغط **Add User** → أدخل إيميلك وكلمة مرور قوية → **Create**

### الخطوة 5.2 — منح صلاحية المدير
1. في Supabase اضغط **SQL Editor**
2. شغّل هذا الأمر (غيّر الإيميل):
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@yourdomain.com';
```

### الخطوة 5.3
1. ارجع للموقع وسجّل دخول بإيميلك
2. ستُحوَّل تلقائياً إلى `/admin`
3. **المنصة جاهزة** ✅

---

## المرحلة 6 — إرسال أول دعوة

1. في لوحة المدير اضغط **+ دعوة جديدة**
2. أدخل اسم المسافر وإيميله
3. اضغط **إرسال رابط الدعوة**
4. يصل إيميل تلقائي للمسافر برابط فردي
5. المسافر يضغط الرابط → ينشئ كلمة مروره → يدخل للمنصة

---

## التكاليف الكاملة

| الخدمة | الخطة | التكلفة |
|--------|-------|---------|
| Supabase | Free (50K مستخدم) | مجاني |
| Vercel | Hobby | مجاني |
| Resend | Free (3K إيميل/شهر) | مجاني |
| GitHub | Free | مجاني |
| **الإجمالي** | | **$0/شهر** |

---

## عند النمو

- Supabase Pro: $25/شهر عند تجاوز 50K مستخدم
- Resend Pro: $20/شهر لـ 50K إيميل
- Vercel Pro: $20/شهر لمزيد من الأداء
