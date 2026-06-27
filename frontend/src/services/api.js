import axios from 'axios'
import { subscriptionEvents } from '../utils/subscriptionEvents' // fix path to match your folder structure


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.code
    if (error.response?.status === 403 && code === 'SUBSCRIPTION_EXPIRED') {
      subscriptionEvents.emit(error.response.data)
    }
    return Promise.reject(error)
  }
)


// CREATE LISTING
export const createListing = (formData) =>
  api.post('/listings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })


// UPDATE LISTING
export const updateListing = (id, formData) =>
  api.post(`/listings/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

export default api