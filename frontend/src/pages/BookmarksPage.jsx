import { useState, useEffect } from 'react'
import { linksAPI } from '../api'
import LinkCard from '../components/LinkCard'
import toast from 'react-hot-toast'

export default function BookmarksPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    linksAPI.getBookmarks()
      .then(res => setLinks(res.data.links))
      .catch(() => toast.error('Failed to load bookmarks'))
      .finally(() => setLoading(false))
  }, [])

  const handleLikeToggle = (id, isLiked, likes) => {
    setLinks(prev => prev.map(l => l._id === id ? { ...l, isLiked, likes } : l))
  }

  const handleBookmarkToggle = (id, isBookmarked) => {
    if (!isBookmarked) setLinks(prev => prev.filter(l => l._id !== id))
    else setLinks(prev => prev.map(l => l._id === id ? { ...l, isBookmarked } : l))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink-100 mb-1.5">
          <span className="text-violet-400">◈</span> Saved Links
        </h1>
        <p className="text-ink-500 text-sm font-body">Your bookmarked links for later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="aspect-video bg-ink-800/60 animate-pulse" />
              <div className="p-3.5 flex flex-col gap-2">
                <div className="h-4 bg-ink-800/60 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">◇</div>
          <h3 className="font-display font-semibold text-ink-400 text-lg mb-2">No bookmarks yet</h3>
          <p className="text-ink-600 text-sm font-body">Save links with ◈ to find them here later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {links.map(link => (
            <LinkCard key={link._id} link={link}
              onLikeToggle={handleLikeToggle}
              onBookmarkToggle={handleBookmarkToggle} />
          ))}
        </div>
      )}
    </div>
  )
}
