import { useState, useEffect, useCallback, useRef } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { linksAPI, categoriesAPI } from '../api'
import LinkCard from '../components/LinkCard'
import toast from 'react-hot-toast'

function AddLinkModal({ categories, onClose, onAdded }) {
  const [form, setForm] = useState({ title: '', url: '', imageUrl: '', description: '', category: categories[0]?._id || '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.url || !form.imageUrl || !form.description || !form.category) {
      return toast.error('All fields are required')
    }
    setLoading(true)
    try {
      const res = await linksAPI.addLink(form)
      onAdded(res.data.link)
      toast.success('Link added! 🔗')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}>
      <div className="bg-ink-900 border border-ink-700/60 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-ink-800/60 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-ink-100">Add New Link</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-200 transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field" placeholder="Give it a great title" />
          </div>
          <div>
            <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Website URL</label>
            <input type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="input-field" placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Image URL</label>
            <input type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              className="input-field" placeholder="https://example.com/image.jpg" />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview"
                className="mt-2 h-24 w-full object-cover rounded-lg border border-ink-700/40"
                onError={e => e.target.style.display='none'}
                onLoad={e => e.target.style.display='block'} />
            )}
          </div>
          <div>
            <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-field">
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field resize-none" rows={3} placeholder="What's this link about?" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '+ Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { searchQuery } = useOutletContext()
  const [searchParams] = useSearchParams()
  const [links, setLinks] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const search = searchParams.get('search') || ''

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await linksAPI.getMyLinks({
        category: activeCategory === 'all' ? undefined : activeCategory,
        search: search || undefined,
        limit: 100
      })
      setLinks(res.data.links)
    } catch {
      toast.error('Failed to load links')
    } finally {
      setLoading(false)
    }
  }, [activeCategory, search])

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.categories)).catch(() => {})
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  const handleLikeToggle = (id, isLiked, likes) => {
    setLinks(prev => prev.map(l => l._id === id ? { ...l, isLiked, likes } : l))
  }

  const handleDelete = (id) => {
    setLinks(prev => prev.filter(l => l._id !== id))
  }

  const handleAdded = (newLink) => {
    setLinks(prev => [newLink, ...prev])
  }

  const Skeleton = () => (
    <div className="card">
      <div className="aspect-video bg-ink-800/60 animate-pulse" />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="h-4 bg-ink-800/60 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-ink-800/40 rounded animate-pulse" />
        <div className="h-3 bg-ink-800/40 rounded animate-pulse w-2/3" />
        <div className="flex gap-1.5 pt-1">
          {[1,2,3].map(i => <div key={i} className="h-7 w-14 bg-ink-800/40 rounded-lg animate-pulse" />)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink-100 mb-1.5">
            {search ? (
              <>Results for <span className="text-gradient">"{search}"</span></>
            ) : (
              <>My <span className="text-gradient">Links</span></>
            )}
          </h1>
          <p className="text-ink-500 font-body text-sm">
            {search ? `${links.length} result${links.length !== 1 ? 's' : ''}` : 'Links you\'ve added to your collection'}
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary shrink-0 text-sm flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> Add Link
        </button>
      </div>

      {/* Category filters */}
      {!search && categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-display font-medium transition-all duration-200 border ${
              activeCategory === 'all'
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/40'
                : 'bg-ink-800/40 text-ink-400 border-ink-700/40 hover:text-ink-200 hover:border-ink-600/60'
            }`}>
            ✦ All
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all duration-200 border ${
                activeCategory === cat._id ? '' : 'bg-ink-800/40 text-ink-400 border-ink-700/40 hover:text-ink-200 hover:border-ink-600/60'
              }`}
              style={activeCategory === cat._id ? {
                background: `${cat.color}15`, color: cat.color,
                borderColor: `${cat.color}50`, boxShadow: `0 2px 12px ${cat.color}15`
              } : {}}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4 opacity-30">🔗</div>
          <h3 className="font-display font-semibold text-ink-400 text-lg mb-2">
            {search ? 'No results found' : 'No links yet'}
          </h3>
          <p className="text-ink-600 text-sm font-body mb-6 max-w-sm">
            {search ? 'Try different search terms.' : 'Start building your collection by adding your first link!'}
          </p>
          {!search && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
              + Add your first link
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {links.map(link => (
            <LinkCard key={link._id} link={link}
              onLikeToggle={handleLikeToggle}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddLinkModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded} />
      )}
    </div>
  )
}
