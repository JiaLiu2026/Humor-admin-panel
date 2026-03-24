"use client";
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

'use client'


export default function ImagesPage() {
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState<string | null>(null)
    const [editUrl, setEditUrl] = useState('')

    const supabase = createClient()

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/login'; return }
        const { data: profile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).single()
        if (!profile?.is_superadmin) { window.location.href = '/login'; return }
        fetchImages()
    }

    async function fetchImages() {
        const { data } = await supabase.from('images').select('id, created_at, url').limit(50)
        setImages(data || [])
        setLoading(false)
    }

    async function deleteImage(id: string) {
        if (!confirm('Delete this image?')) return
        await supabase.from('images').delete().eq('id', id)
        fetchImages()
    }

    async function updateImage(id: string) {
        await supabase.from('images').update({ url: editUrl }).eq('id', id)
        setEditId(null)
        fetchImages()
    }

    async function createImage() {
        const url = prompt('Enter image URL:')
        if (!url) return
        await supabase.from('images').insert({ url })
        fetchImages()
    }

    useEffect(() => { checkAuth() }, [])

    return (
        <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>🖼️ Images</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={createImage} style={{ background: '#43aa8b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Image</button>
                        <Link href="/admin" style={{ color: '#a8a8b3', textDecoration: 'none' }}>← Back</Link>
                    </div>
                </div>
                {loading ? <p style={{ color: '#a8a8b3' }}>Loading...</p> : (
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>ID</th>
                                    <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>URL</th>
                                    <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>Created</th>
                                    <th style={{ color: '#a8a8b3', padding: '1rem', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {images.map((img: any) => (
                                    <tr key={img.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ color: '#fff', padding: '1rem', fontSize: '0.8rem' }}>{img.id?.slice(0, 8)}...</td>
                                        <td style={{ color: '#a8a8b3', padding: '1rem', maxWidth: '300px' }}>
                                            {editId === img.id ? (
                                                <input value={editUrl} onChange={e => setEditUrl(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #555', color: 'white', padding: '0.3rem', borderRadius: '4px', width: '100%' }} />
                                            ) : (
                                                <span style={{ fontSize: '0.8rem' }}>{img.url?.slice(0, 50)}...</span>
                                            )}
                                        </td>
                                        <td style={{ color: '#a8a8b3', padding: '1rem', whiteSpace: 'nowrap' }}>{img.created_at ? new Date(img.created_at).toLocaleDateString() : 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {editId === img.id ? (
                                                    <>
                                                        <button onClick={() => updateImage(img.id)} style={{ background: '#43aa8b', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                                                        <button onClick={() => setEditId(null)} style={{ background: '#555', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => { setEditId(img.id); setEditUrl(img.url || '') }} style={{ background: '#f9c74f', color: '#333', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                                        <button onClick={() => deleteImage(img.id)} style={{ background: '#e94560', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    )
}