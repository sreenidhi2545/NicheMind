import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const analyseNiche = async (niche) => {
  const response = await axios.post(`${BASE_URL}/research`, { niche })
  return response.data
}

export const checkHealth = async () => {
  const response = await axios.get(`${BASE_URL}/health`)
  return response.data
}
