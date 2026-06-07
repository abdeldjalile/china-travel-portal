import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, full_name } = await req.json()

    if (!email) return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })

    // Check if already registered
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) return NextResponse.json({ error: 'هذا البريد مسجل مسبقاً' }, { status: 400 })

    // Generate single-use token
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Save invite to DB
    const { error: dbError } = await supabaseAdmin.from('invites').insert({
      email,
      full_name: full_name || '',
      token,
      used: false,
      expires_at: expiresAt.toISOString(),
    })

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/register?token=${token}`

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: '🇨🇳 دعوتك لبوابة المسافر — الصين',
      html: `
        <div style="direction:rtl; font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff;">
          <div style="text-align:center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 8px;">🇨🇳</div>
            <h1 style="color: #C0392B; font-size: 20px; margin: 0;">بوابة المسافر للصين</h1>
            <p style="color: #666; font-size: 14px; margin-top: 4px;">Canton Fair · Business Travel Guide</p>
          </div>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            مرحباً ${full_name || ''}،<br/><br/>
            تمت دعوتك للوصول إلى بوابة المسافر — الدليل الرسمي لرحلتك التجارية إلى الصين.
          </p>
          <div style="background: #f9f9f9; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0 0 12px;">اضغط على الزر لإنشاء حسابك</p>
            <a href="${inviteUrl}"
               style="display:inline-block; background: #C0392B; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: bold;">
              إنشاء حسابي الآن
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            هذا الرابط صالح لمرة واحدة فقط ولمدة 7 أيام<br/>
            إذا لم تطلب هذه الدعوة، تجاهل هذا الإيميل
          </p>
        </div>
      `,
    })

    if (emailError) {
      console.error('Email error:', emailError)
      // Return link even if email failed — admin can copy it
      return NextResponse.json({ success: true, invite_url: inviteUrl, email_sent: false })
    }

    return NextResponse.json({ success: true, invite_url: inviteUrl, email_sent: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
