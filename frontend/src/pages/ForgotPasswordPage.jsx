import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../api'
import toast from 'react-hot-toast'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-500 rounded-2xl text-2xl shadow-2xl shadow-violet-900/40 mb-4">🔗</div>
          <h1 className="font-display font-bold text-3xl text-gradient">HookLinks</h1>
        </div>
        <div className="glass rounded-2xl p-8 shadow-2xl shadow-ink-950/80">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="font-display font-bold text-xl text-ink-100 mb-2">Email sent!</h2>
              <p className="text-ink-400 text-sm font-body mb-6">Check your inbox for the password reset link. It expires in 1 hour.</p>
              <Link to="/login" className="btn-ghost text-sm inline-block">← Back to login</Link>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-xl text-ink-100 mb-1">Forgot password?</h2>
              <p className="text-ink-500 text-sm font-body mb-6">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" className="input-field" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-ink-500 text-sm mt-5 font-body">
                <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors">← Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
