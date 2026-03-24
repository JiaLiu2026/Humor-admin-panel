import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_superadmin) redirect('/login')

    // Get stats
    const [{ count: userCount }, { count: captionCount }, { count: imageCount }, { count: voteCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('captions').select('*', { count: 'exact', head: true }),
        supabase.from('images').select('*', { count: 'exact', head: true }),
        supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    ])

    return (
        <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>🛠️ Admin Dashboard</h1>
                    <a href="/admin/logout" style={{ color: '#a8a8b3', textDecoration: 'none' }}>Logout</a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Users', value: userCount, emoji: '👥' },
                        { label: 'Captions', value: captionCount, emoji: '💬' },
                        { label: 'Images', value: imageCount, emoji: '🖼️' },
                        { label: 'Votes', value: voteCount, emoji: '🗳️' },
                    ].map(stat => (
                        <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem' }}>{stat.emoji}</div>
                            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>{stat.value?.toLocaleString()}</div>
                            <div style={{ color: '#a8a8b3' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                        { href: '/admin/users', label: '👥 Manage Users', desc: 'View all profiles' },
                        { href: '/admin/images', label: '🖼️ Manage Images', desc: 'Create, read, update, delete' },
                        { href: '/admin/captions', label: '💬 Manage Captions', desc: 'View all captions' },
                    ].map(item => (
                        <Link key={item.href} href={item.href} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', textDecoration: 'none', display: 'block' }}>
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.label}</div>
                            <div style={{ color: '#a8a8b3' }}>{item.desc}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}