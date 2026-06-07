import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { token, password, email } = await req.json()

    // Validate invite token
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) return NextResponse.json({ error: 'رابط غير صالح' }, { status: 400 })
    if (invite.used) return NextResponse.json({ error: 'هذا الرابط تم استخدامه مسبقاً' }, { status: 400 })
    if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'انتهت صلاحية الرابط' }, { status: 400 })

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
    })

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    // Create profile
    await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email: invite.email,
      full_name: invite.full_name || '',
      role: 'traveler',
      status: 'active',
    })

    // Mark invite as used
    await supabaseAdmin.from('invites').update({ used: true, used_at: new Date().toISOString() }).eq('token', token)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
