import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email || !form.password) return toast.error('All fields required')
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) return toast.error('Enter a valid Gmail/email')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      toast.success('Account created! Welcome to HookLinks 🔗')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-pink-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-500 rounded-2xl text-2xl shadow-2xl shadow-violet-900/40 mb-4">🔗</div>
          <h1 className="font-display font-bold text-3xl text-gradient">HookLinks</h1>
          <p className="text-ink-500 text-sm mt-1.5 font-body">Discover & organize amazing links</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl shadow-ink-950/80">
          <h2 className="font-display font-bold text-xl text-ink-100 mb-1">Create account</h2>
          <p className="text-ink-500 text-sm font-body mb-6">Join the community. It's free.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="cooluser123"
                className="input-field"
                minLength={3}
                maxLength={30}
              />
              <p className="text-xs text-ink-600 mt-1 font-body">3–30 characters. Must be unique.</p>
            </div>

            <div>
              <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@gmail.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="input-field pr-11"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors text-sm">
                  {showPass ? '◉' : '○'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat your password"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-ink-500 text-sm mt-6 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
