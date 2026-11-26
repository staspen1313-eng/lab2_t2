import axios from 'axios'

interface ApiErrorResponse {
  message?: string
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const message =
        error.response?.data?.message ??
        error.message ??
        'Не вдалося зв’язатися із сервером.'

      return Promise.reject(new Error(message))
    }

    return Promise.reject(error)
  },
)
