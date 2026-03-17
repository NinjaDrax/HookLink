import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { linksAPI, categoriesAPI } from '../api'
import LinkCard from '../components/LinkCard'
import toast from 'react-hot-toast'

export default function OneForAllPage() {
  const [searchParams] = useSearchParams()
  const [links, setLinks] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') || ''

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await linksAPI.getAllLinks({
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

  const Skeleton = () => (
    <div className="card">
      <div className="aspect-video bg-ink-800/60 animate-pulse" />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="h-4 bg-ink-800/60 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-ink-800/40 rounded animate-pulse" />
        <div className="flex gap-1.5 pt-1">
          {[1,2,3].map(i => <div key={i} className="h-7 w-14 bg-ink-800/40 rounded-lg animate-pulse" />)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink-100 mb-1.5">
          {search ? (
            <>Results for <span className="text-gradient">"{search}"</span></>
          ) : (
            <><span className="text-gradient">One for All</span> 🌐</>
          )}
        </h1>
        <p className="text-ink-500 font-body text-sm">
          {search
            ? `${links.length} result${links.length !== 1 ? 's' : ''} across all users`
            : 'Every link shared by the entire community'}
        </p>
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
            🌐 All
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all duration-200 border ${
                activeCategory === cat._id ? '' : 'bg-ink-800/40 text-ink-400 border-ink-700/40 hover:text-ink-200 hover:border-ink-600/60'
              }`}
              style={activeCategory === cat._id ? {
                background: `${cat.color}15`, color: cat.color,
                borderColor: `${cat.color}50`
              } : {}}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4 opacity-30">🌐</div>
          <h3 className="font-display font-semibold text-ink-400 text-lg mb-2">
            {search ? 'No results found' : 'Nothing here yet'}
          </h3>
          <p className="text-ink-600 text-sm font-body max-w-sm">
            {search ? 'Try different search terms.' : 'Be the first to add a link! Go to My Links and add one.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {links.map(link => (
              <LinkCard
                key={link._id}
                link={link}
                onLikeToggle={handleLikeToggle}
                showOwner={true}
              />
            ))}
          </div>
          <p className="text-center text-ink-600 text-xs font-body mt-8">
            {links.length} link{links.length !== 1 ? 's' : ''} from the community
          </p>
        </>
      )}
    </div>
  )
}
