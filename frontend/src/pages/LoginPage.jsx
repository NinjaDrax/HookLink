import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.password) return toast.error('All fields required')
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back! 🔗')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* BG effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-500 rounded-2xl text-2xl shadow-2xl shadow-violet-900/40 mb-4">
            🔗
          </div>
          <h1 className="font-display font-bold text-3xl text-gradient">HookLinks</h1>
          <p className="text-ink-500 text-sm mt-1.5 font-body">Your curated link universe</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl shadow-ink-950/80">
          <h2 className="font-display font-bold text-xl text-ink-100 mb-1">Sign in</h2>
          <p className="text-ink-500 text-sm font-body mb-6">Welcome back. Enter your credentials.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="your_username"
                className="input-field"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors text-sm">
                  {showPass ? '◉' : '○'}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-body">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-ink-500 text-sm mt-6 font-body">
            Don't have an account?{' '}
            <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
