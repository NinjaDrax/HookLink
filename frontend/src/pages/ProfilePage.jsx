import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../api'
import toast from 'react-hot-toast'

function resizeImageToBase64(file, maxSize = 300) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > h) { if (w > maxSize) { h = (h * maxSize) / w; w = maxSize } }
        else { if (h > maxSize) { w = (w * maxSize) / h; h = maxSize } }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [imgPreview, setImgPreview] = useState(user?.avatar || '')

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file')
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB')
    try {
      const base64 = await resizeImageToBase64(file, 300)
      setImgPreview(base64)
      setForm(f => ({ ...f, avatar: base64 }))
    } catch {
      toast.error('Failed to process image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return toast.error('New passwords do not match')
    }
    if (form.newPassword && form.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters')
    }
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, avatar: form.avatar }
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword
        payload.newPassword = form.newPassword
      }
      const res = await authAPI.updateProfile(payload)
      updateUser(res.data.user)
      toast.success('Profile updated!')
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const displayAvatar = imgPreview ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=6d28d9&textColor=fff`

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink-100 mb-1.5">Edit Profile</h1>
        <p className="text-ink-500 text-sm font-body">Manage your account settings</p>
      </div>

      <div className="glass rounded-2xl p-6 sm:p-8">
        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <img
              src={displayAvatar}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-ink-700/60 group-hover:border-violet-500/50 transition-colors shadow-lg"
              onError={e => {
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=6d28d9&textColor=fff`
              }}
            />
            {/* Upload overlay */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-display font-medium gap-1 backdrop-blur-sm">
              <span className="text-base">📷</span> Change
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors font-body">
            Upload photo
          </button>
          <p className="text-ink-600 text-xs mt-1 font-body">JPG, PNG, GIF up to 5MB</p>

          <div className="mt-3 text-center">
            <p className="font-display font-semibold text-ink-100">{user?.name}</p>
            <p className="text-ink-500 text-sm font-body">{user?.email}</p>
            {user?.isAdmin && (
              <span className="inline-flex items-center gap-1 tag mt-1.5 bg-violet-500/15 text-violet-300 border border-violet-500/30">
                ⚙ Admin
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Or paste image URL */}
          <div>
            <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Or paste image URL</label>
            <input
              type="url"
              value={form.avatar.startsWith('data:') ? '' : form.avatar}
              onChange={e => {
                setForm(f => ({ ...f, avatar: e.target.value }))
                setImgPreview(e.target.value)
              }}
              placeholder="https://example.com/photo.jpg"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Username</label>
              <input type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-field" minLength={3} maxLength={30} />
            </div>
            <div>
              <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" />
            </div>
          </div>

          <div className="border-t border-ink-800/60 pt-5">
            <h3 className="font-display font-semibold text-ink-300 text-sm mb-4">Change Password <span className="text-ink-600 font-normal">(optional)</span></h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Current Password</label>
                <div className="relative">
                  <input type={showCurrent ? 'text' : 'password'} value={form.currentPassword}
                    onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="Enter current password" className="input-field pr-11" />
                  <button type="button" onClick={() => setShowCurrent(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors text-sm">
                    {showCurrent ? '◉' : '○'}
                  </button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={form.newPassword}
                      onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder="Min 6 characters" className="input-field pr-11" />
                    <button type="button" onClick={() => setShowNew(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors text-sm">
                      {showNew ? '◉' : '○'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-display font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Confirm New</label>
                  <input type="password" value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password" className="input-field" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
