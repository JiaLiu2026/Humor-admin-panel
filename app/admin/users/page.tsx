import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) redirect('/login')

  const { data: users } = await supabase
    .from('profiles')
    .select('id, created_at, is_superadmin')
    .limit(50)

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>👥 Users</h1>
          <Link href="/admin" style={{ color: '#a8a8b3', textDecoration: 'none' }}>← Back</Link>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>Created</th>
                <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>Superadmin</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u: any) => (
                <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ color: '#fff', padding: '1rem', fontSize: '0.8rem' }}>{u.id}</td>
                  <td style={{ color: '#a8a8b3', padding: '1rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: u.is_superadmin ? '#43aa8b' : '#555', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.8rem' }}>
                      {u.is_superadmin ? 'Yes' : 'No'}
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