'use client'

import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
        <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Panel</h1>
        <p style={{ color: '#a8a8b3', marginBottom: '2rem' }}>Superadmin access only</p>
        <button onClick={signInWithGoogle} style={{ background: 'white', color: '#333', border: 'none', padding: '0.8rem 2rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
          Sign in with Google
        </button>
      </div>
    </main>
  )
}