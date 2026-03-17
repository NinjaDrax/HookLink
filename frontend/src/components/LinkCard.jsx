import { useState } from 'react'
import { linksAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LinkCard({ link, onLikeToggle, onDelete, showOwner = false }) {
  const { user } = useAuth()
  const [imgError, setImgError] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = user?._id === link.addedBy?._id || user?._id === link.addedBy

  const handleLike = async (e) => {
    e.stopPropagation()
    if (liking) return
    setLiking(true)
    try {
      const res = await linksAPI.toggleLike(link._id)
      onLikeToggle?.(link._id, res.data.isLiked, res.data.likes)
      toast(res.data.isLiked ? '❤️ Liked!' : '🤍 Unliked', { duration: 1500 })
    } catch {
      toast.error('Failed to update like')
    } finally {
      setLiking(false)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this link?')) return
    setDeleting(true)
    try {
      await linksAPI.deleteLink(link._id)
      onDelete?.(link._id)
      toast.success('Link deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const categoryColor = link.category?.color || '#6366f1'
  const categoryIcon = link.category?.icon || '🔗'

  return (
    <>
      <article className="group card flex flex-col bg-ink-900/70 hover:bg-ink-900/90">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-ink-800/60">
          {!imgError ? (
            <img
              src={link.imageUrl}
              alt={link.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900">
              <span className="text-4xl opacity-30">🔗</span>
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className="tag text-white/90 backdrop-blur-md"
              style={{ background: `${categoryColor}30`, border: `1px solid ${categoryColor}50` }}>
              <span>{categoryIcon}</span>
              <span style={{ color: categoryColor }}>{link.category?.name}</span>
            </span>
          </div>
          {/* Likes count */}
          <div className="absolute top-2.5 right-2.5">
            <span className="tag bg-ink-950/70 backdrop-blur-md border border-ink-700/40 text-ink-300">
              ♥ {link.likes}
            </span>
          </div>
          {/* Owner badge */}
          {showOwner && link.addedBy?.name && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="tag bg-ink-950/70 backdrop-blur-md border border-ink-700/30 text-ink-400 text-xs">
                @{link.addedBy.name}
              </span>
            </div>
          )}
          {/* Delete button for owner */}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-red-900/70 backdrop-blur-md border border-red-700/50 text-red-300 hover:bg-red-800/80 hover:text-red-200 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs">
              {deleting ? '…' : '✕'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5 gap-2">
          <h3 className="font-display font-semibold text-ink-100 text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {link.title}
          </h3>
          <p className="text-ink-500 text-xs font-body line-clamp-2 flex-1 leading-relaxed">
            {link.description}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <button onClick={handleLike} disabled={liking}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-200 ${
                link.isLiked
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30'
                  : 'bg-ink-800/60 text-ink-400 border border-ink-700/40 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10'
              }`}>
              {link.isLiked ? '♥' : '♡'} Like
            </button>

            <a href={link.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-display font-medium bg-ink-800/60 text-ink-400 border border-ink-700/40 hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-200">
              ↗ Visit
            </a>

            <button onClick={() => setInfoOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-display font-medium bg-ink-800/60 text-ink-400 border border-ink-700/40 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-200">
              ℹ Info
            </button>
          </div>
        </div>
      </article>

      {/* Info Modal */}
      {infoOpen && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setInfoOpen(false)}>
          <div className="bg-ink-900 border border-ink-700/60 rounded-2xl w-full max-w-md shadow-2xl shadow-ink-950 animate-scale-in overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {!imgError && (
              <div className="aspect-video overflow-hidden">
                <img src={link.imageUrl} alt={link.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="font-display font-bold text-lg text-ink-100 leading-snug">{link.title}</h2>
                <button onClick={() => setInfoOpen(false)} className="text-ink-500 hover:text-ink-200 transition-colors shrink-0 mt-0.5">✕</button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="tag"
                  style={{ background: `${categoryColor}20`, border: `1px solid ${categoryColor}40`, color: categoryColor }}>
                  {categoryIcon} {link.category?.name}
                </span>
                {link.addedBy?.name && (
                  <span className="tag bg-ink-800/60 text-ink-400 border border-ink-700/40 text-xs">
                    by @{link.addedBy.name}
                  </span>
                )}
              </div>
              <p className="text-ink-300 text-sm font-body leading-relaxed mb-5">{link.description}</p>
              <div className="flex items-center gap-3">
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  className="btn-primary flex-1 text-center text-sm py-2">
                  ↗ Visit Website
                </a>
                <button onClick={handleLike}
                  className={`px-4 py-2 rounded-xl text-sm font-display font-medium border transition-all ${
                    link.isLiked
                      ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                      : 'bg-ink-800 text-ink-400 border-ink-700 hover:border-pink-500/30 hover:text-pink-400'
                  }`}>
                  {link.isLiked ? '♥' : '♡'} {link.likes}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
