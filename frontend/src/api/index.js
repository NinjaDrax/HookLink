import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('hl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hl_token')
      localStorage.removeItem('hl_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  signup: d => api.post('/auth/signup', d),
  login: d => api.post('/auth/login', d),
  me: () => api.get('/auth/me'),
  updateProfile: d => api.put('/auth/profile', d),
  forgotPassword: email => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
}

export const linksAPI = {
  getMyLinks: params => api.get('/links', { params }),
  getAllLinks: params => api.get('/links/all', { params }),
  getLiked: () => api.get('/links/liked'),
  addLink: data => api.post('/links', data),
  updateLink: (id, data) => api.put(`/links/${id}`, data),
  deleteLink: id => api.delete(`/links/${id}`),
  toggleLike: id => api.post(`/links/${id}/like`)
}

export const categoriesAPI = {
  getAll: () => api.get('/categories')
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getLinks: () => api.get('/admin/links'),
  addLink: d => api.post('/admin/links', d),
  updateLink: (id, d) => api.put(`/admin/links/${id}`, d),
  deleteLink: id => api.delete(`/admin/links/${id}`),
  addCategory: d => api.post('/admin/categories', d),
  updateCategory: (id, d) => api.put(`/admin/categories/${id}`, d),
  deleteCategory: id => api.delete(`/admin/categories/${id}`)
}

export default api
