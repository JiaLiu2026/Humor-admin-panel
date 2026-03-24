import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CaptionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) redirect('/login')

  const { data: captions } = await supabase
    .from('captions')
    .select('id, content, created_datetime_utc, is_public')
    .not('content', 'is', null)
    .limit(50)

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>💬 Captions</h1>
          <Link href="/admin" style={{ color: '#a8a8b3', textDecoration: 'none' }}>← Back</Link>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>Content</th>
                <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>Created</th>
                <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>Public</th>
              </tr>
            </thead>
            <tbody>
              {captions?.map((c: any) => (
                <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ color: '#fff', padding: '1rem', maxWidth: '400px' }}>{c.content}</td>
                  <td style={{ color: '#a8a8b3', padding: '1rem', whiteSpace: 'nowrap' }}>{new Date(c.created_datetime_utc).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: c.is_public ? '#43aa8b' : '#555', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.8rem' }}>
                      {c.is_public ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}