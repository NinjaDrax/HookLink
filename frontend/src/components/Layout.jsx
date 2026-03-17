import { useState, useRef, useEffect, useCallback } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)
  const searchTimer = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync search input with URL param on page change
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearch(params.get('search') || '')
  }, [location.pathname])

  // Real-time search with debounce
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      const base = location.pathname === '/one-for-all' ? '/one-for-all' : '/'
      if (val.trim()) navigate(`${base}?search=${encodeURIComponent(val.trim())}`, { replace: true })
      else navigate(base, { replace: true })
    }, 280)
  }, [location.pathname, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/', label: 'My Links', icon: '✦' },
    { to: '/one-for-all', label: 'One for All', icon: '🌐' },
    { to: '/liked', label: 'Liked', icon: '♥' },
  ]

  const avatar = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=6d28d9&textColor=fff`

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-purple-900/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-900/6 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-ink-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-500 rounded-lg flex items-center justify-center text-base shadow-lg shadow-violet-900/40 group-hover:shadow-violet-700/50 transition-shadow">
                🔗
              </div>
              <span className="font-display font-bold text-lg text-gradient hidden sm:block">HookLinks</span>
            </Link>

            {/* Search - real-time */}
            <div className="flex-1 max-w-xl mx-auto">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 text-sm pointer-events-none">⌕</span>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search as you type..."
                  className="w-full bg-ink-800/50 border border-ink-700/50 focus:border-violet-500/60 text-ink-200 placeholder-ink-500 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/15 transition-all font-body"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('')
                      const base = location.pathname === '/one-for-all' ? '/one-for-all' : '/'
                      navigate(base, { replace: true })
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors text-xs">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Nav links desktop */}
              <nav className="hidden md:flex items-center gap-0.5">
                {navLinks.map(n => (
                  <Link key={n.to} to={n.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
                      location.pathname === n.to
                        ? 'bg-violet-600/20 text-violet-300'
                        : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800/60'
                    }`}>
                    <span className="text-xs">{n.icon}</span>
                    {n.label}
                  </Link>
                ))}
              </nav>

              {/* User dropdown */}
              <div className="relative ml-1" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(d => !d)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-ink-800/60 transition-all group">
                  <img
                    src={avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg object-cover border border-ink-700/60 group-hover:border-violet-500/50 transition-colors"
                    onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=6d28d9&textColor=fff` }}
                  />
                  <span className="hidden sm:block text-sm font-display font-medium text-ink-300 group-hover:text-ink-100 transition-colors max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <span className="text-ink-500 text-xs hidden sm:block">▾</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl shadow-2xl shadow-ink-950/80 border border-ink-700/40 overflow-hidden animate-scale-in z-50">
                    <div className="px-4 py-3 border-b border-ink-800/60">
                      <p className="text-sm font-display font-semibold text-ink-100 truncate">{user?.name}</p>
                      <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {/* Mobile nav links */}
                      {navLinks.map(n => (
                        <Link key={n.to} to={n.to} onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-300 hover:bg-ink-800/60 hover:text-ink-100 transition-colors font-body md:hidden">
                          <span>{n.icon}</span> {n.label}
                        </Link>
                      ))}
                      {user?.isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-violet-300 hover:bg-violet-600/10 transition-colors font-body">
                          <span>⚙</span> Admin Panel
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-300 hover:bg-ink-800/60 hover:text-ink-100 transition-colors font-body">
                        <span>✎</span> Edit Profile
                      </Link>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-pink-400 hover:bg-pink-900/20 transition-colors font-body border-t border-ink-800/60 mt-1">
                        <span>⏻</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="relative z-10 flex-1">
        <Outlet context={{ searchQuery: new URLSearchParams(location.search).get('search') || '' }} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ink-800/30 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gradient font-display font-bold">HookLinks</span>
            <span className="text-ink-600 text-sm">— your link universe</span>
          </div>
          <p className="text-ink-600 text-xs font-body">© 2024 HookLinks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
