import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await supabaseAdmin.auth.admin.deleteUser(id)
    await supabaseAdmin.from('profiles').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
