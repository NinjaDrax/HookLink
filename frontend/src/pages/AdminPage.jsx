import { useState, useEffect } from 'react'
import { adminAPI, categoriesAPI } from '../api'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = ['🔗','💻','🎨','📚','🎵','🎬','🎮','🌱','🎓','🧁','🚊','📺','📷','💿','📽','🛋','🛒','🧸','🎟']
const CATEGORY_COLORS = ['#6366f1','#8b5cf6','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#e9edc9','#a8dadc','#ccd5ae','#f2cc8f']

export default function AdminPage() {
  const [tab, setTab] = useState('links')
  const [links, setLinks] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editLink, setEditLink] = useState(null)
  const [editCat, setEditCat] = useState(null)

  const [linkForm, setLinkForm] = useState({ title: '', url: '', imageUrl: '', description: '', category: '' })
  const [catForm, setCatForm] = useState({ name: '', icon: '🔗', color: '#6366f1' })
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [linksRes, catsRes, statsRes] = await Promise.all([
        adminAPI.getLinks(), categoriesAPI.getAll(), adminAPI.getStats()
      ])
      setLinks(linksRes.data.links)
      setCategories(catsRes.data.categories)
      setStats(statsRes.data.stats)
    } catch { toast.error('Failed to load admin data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const openAddLink = () => { setLinkForm({ title: '', url: '', imageUrl: '', description: '', category: categories[0]?._id || '' }); setEditLink(null); setShowLinkModal(true) }
  const openEditLink = (link) => { setLinkForm({ title: link.title, url: link.url, imageUrl: link.imageUrl, description: link.description, category: link.category?._id || '' }); setEditLink(link); setShowLinkModal(true) }
  const openAddCat = () => { setCatForm({ name: '', icon: '🔗', color: '#6366f1' }); setEditCat(null); setShowCatModal(true) }
  const openEditCat = (cat) => { setCatForm({ name: cat.name, icon: cat.icon, color: cat.color }); setEditCat(cat); setShowCatModal(true) }

  const handleLinkSubmit = async (e) => {
    e.preventDefault()
    if (!linkForm.title || !linkForm.url || !linkForm.imageUrl || !linkForm.description || !linkForm.category) {
      return toast.error('All fields required')
    }
    setSubmitting(true)
    try {
      if (editLink) {
        const res = await adminAPI.updateLink(editLink._id, linkForm)
        setLinks(prev => prev.map(l => l._id === editLink._id ? res.data.link : l))
        toast.success('Link updated!')
      } else {
        const res = await adminAPI.addLink(linkForm)
        setLinks(prev => [res.data.link, ...prev])
        toast.success('Link added!')
      }
      setShowLinkModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleDeleteLink = async (id) => {
    if (!confirm('Delete this link?')) return
    try {
      await adminAPI.deleteLink(id)
      setLinks(prev => prev.filter(l => l._id !== id))
      toast.success('Link deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleCatSubmit = async (e) => {
    e.preventDefault()
    if (!catForm.name) return toast.error('Category name required')
    setSubmitting(true)
    try {
      if (editCat) {
        const res = await adminAPI.updateCategory(editCat._id, catForm)
        setCategories(prev => prev.map(c => c._id === editCat._id ? res.data.category : c))
        toast.success('Category updated!')
      } else {
        const res = await adminAPI.addCategory(catForm)
        setCategories(prev => [...prev, res.data.category])
        toast.success('Category created!')
      }
      setShowCatModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleDeleteCat = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await adminAPI.deleteCategory(id)
      setCategories(prev => prev.filter(c => c._id !== id))
      toast.success('Category deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink-100 mb-1.5">⚙ Admin Panel</h1>
        <p className="text-ink-500 text-sm font-body">Manage links, categories, and content</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Links', value: stats.totalLinks, icon: '🔗', color: '#6366f1' },
            { label: 'Categories', value: stats.totalCategories, icon: '📂', color: '#8b5cf6' },
            { label: 'Users', value: stats.totalUsers, icon: '👥', color: '#ec4899' }
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-4 border border-ink-700/30">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display font-bold text-2xl text-ink-100">{s.value}</div>
              <div className="text-ink-500 text-xs font-body">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-ink-800/60">
        {[['links', '🔗 Links'], ['categories', '📂 Categories']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-display font-medium transition-all border-b-2 -mb-px ${
              tab === t ? 'text-violet-300 border-violet-500' : 'text-ink-500 border-transparent hover:text-ink-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Links Tab */}
      {tab === 'links' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-ink-500 text-sm font-body">{links.length} links total</p>
            <button onClick={openAddLink} className="btn-primary text-sm py-2">+ Add Link</button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-ink-800/40 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {links.map(link => (
                <div key={link._id} className="flex items-center gap-3 p-3 glass rounded-xl border border-ink-800/40 hover:border-ink-700/60 transition-all">
                  <img src={link.imageUrl} alt={link.title}
                    className="w-12 h-9 object-cover rounded-lg shrink-0 bg-ink-800"
                    onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="18" font-size="18">🔗</text></svg>' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-sm text-ink-200 truncate">{link.title}</p>
                    <p className="text-xs text-ink-600 truncate font-body">{link.url}</p>
                  </div>
                  <span className="tag shrink-0 hidden sm:flex"
                    style={{ background: `${link.category?.color || '#6366f1'}20`, border: `1px solid ${link.category?.color || '#6366f1'}40`, color: link.category?.color || '#6366f1' }}>
                    {link.category?.icon} {link.category?.name}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditLink(link)}
                      className="p-1.5 rounded-lg text-ink-500 hover:text-ink-200 hover:bg-ink-700/50 transition-all text-sm">✎</button>
                    <button onClick={() => handleDeleteLink(link._id)}
                      className="p-1.5 rounded-lg text-ink-500 hover:text-pink-400 hover:bg-pink-900/20 transition-all text-sm">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-ink-500 text-sm font-body">{categories.length} categories</p>
            <button onClick={openAddCat} className="btn-primary text-sm py-2">+ Add Category</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map(cat => (
              <div key={cat._id} className="glass rounded-xl p-4 border border-ink-800/40 hover:border-ink-700/60 transition-all">
                <div className="text-2xl mb-2">{cat.icon}</div>
                <p className="font-display font-semibold text-sm text-ink-200">{cat.name}</p>
                <div className="flex gap-1.5 mt-3">
                  <button onClick={() => openEditCat(cat)}
                    className="flex-1 py-1 text-xs bg-ink-800/60 text-ink-400 rounded-lg hover:bg-ink-700/60 transition-all font-body">Edit</button>
                  <button onClick={() => handleDeleteCat(cat._id)}
                    className="flex-1 py-1 text-xs bg-pink-900/20 text-pink-500 rounded-lg hover:bg-pink-900/40 transition-all font-body">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowLinkModal(false)}>
          <div className="bg-ink-900 border border-ink-700/60 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-ink-800/60 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-ink-100">{editLink ? 'Edit Link' : 'Add New Link'}</h2>
              <button onClick={() => setShowLinkModal(false)} className="text-ink-500 hover:text-ink-200 transition-colors">✕</button>
            </div>
            <form onSubmit={handleLinkSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Title</label>
                <input type="text" value={linkForm.title} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Link title" />
              </div>
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Website URL</label>
                <input type="url" value={linkForm.url} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} className="input-field" placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Image URL</label>
                <input type="url" value={linkForm.imageUrl} onChange={e => setLinkForm(f => ({ ...f, imageUrl: e.target.value }))} className="input-field" placeholder="https://example.com/image.jpg" />
                {linkForm.imageUrl && (
                  <img src={linkForm.imageUrl} alt="preview"
                    className="mt-2 h-24 w-full object-cover rounded-lg border border-ink-700/40"
                    onError={e => e.target.style.display = 'none'} />
                )}
              </div>
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Category</label>
                <select value={linkForm.category} onChange={e => setLinkForm(f => ({ ...f, category: e.target.value }))}
                  className="input-field">
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={linkForm.description} onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field resize-none" rows={3} placeholder="Describe this link..." />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowLinkModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></> : (editLink ? 'Update' : 'Add Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCatModal(false)}>
          <div className="bg-ink-900 border border-ink-700/60 rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-ink-800/60 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-ink-100">{editCat ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowCatModal(false)} className="text-ink-500 hover:text-ink-200 transition-colors">✕</button>
            </div>
            <form onSubmit={handleCatSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Name</label>
                <input type="text" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Category name" />
              </div>
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-2 uppercase tracking-wide">Icon</label>
                <div className="grid grid-cols-10 gap-1.5">
                  {CATEGORY_ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setCatForm(f => ({ ...f, icon }))}
                      className={`p-1.5 rounded-lg text-lg transition-all ${catForm.icon === icon ? 'bg-violet-600/30 ring-1 ring-violet-500/60' : 'hover:bg-ink-700/60'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-2 uppercase tracking-wide">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setCatForm(f => ({ ...f, color }))}
                      className={`w-7 h-7 rounded-lg transition-all ${catForm.color === color ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-ink-900 scale-110' : 'hover:scale-105'}`}
                      style={{ background: color }} />
                  ))}
                </div>
              </div>
              {/* Preview */}
              <div className="p-3 bg-ink-800/40 rounded-xl border border-ink-700/30">
                <p className="text-xs text-ink-500 mb-2 font-body">Preview:</p>
                <span className="tag" style={{ background: `${catForm.color}20`, border: `1px solid ${catForm.color}40`, color: catForm.color }}>
                  {catForm.icon} {catForm.name || 'Category'}
                </span>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCatModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editCat ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
