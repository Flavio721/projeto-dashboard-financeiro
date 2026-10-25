export type UserSession = { id: string; name: string; email: string; profile: string; monthlyExpenses?: string | number | null }

type ApiErrorBody = { error?: { message?: string; code?: string; details?: Array<{ field?: string; message?: string }> } }

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'
let accessToken: string | null = null
let sessionUser: UserSession | null = null
let refreshing: Promise<boolean> | null = null

export function getSessionUser() {
  return sessionUser
}

export function clearSession() {
  accessToken = null
  sessionUser = null
  window.dispatchEvent(new Event('financas:session'))
}

export function setSession(data: { accessToken: string; user: UserSession }) {
  accessToken = data.accessToken
  sessionUser = data.user
  window.dispatchEvent(new Event('financas:session'))
}

export function updateSessionUser(user: UserSession) {
  sessionUser = user
  window.dispatchEvent(new Event('financas:session'))
}

async function refreshSession() {
  if (!refreshing) {
    refreshing = fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'refresh' }, body: '{}' })
      .then(async response => {
        if (!response.ok) return false
        const data = await response.json() as { accessToken: string; user: UserSession }
        setSession(data)
        return true
      })
      .catch(() => false)
      .finally(() => { refreshing = null })
  }
  return refreshing
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const run = () => fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': 'app',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
  })
  let response = await run()
  if (response.status === 401 && !path.startsWith('/auth/')) {
    if (await refreshSession()) response = await run()
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as ApiErrorBody
    throw new Error(error.error?.message || `Não foi possível concluir a solicitação (${response.status}).`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function submitAuth(mode: 'login' | 'register', values: { name?: string; email: string; password: string }) {
  const data = await apiRequest<{ accessToken: string; user: UserSession }>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(values) })
  setSession(data)
  return data.user
}

export async function signOut() {
  try { await apiRequest<void>('/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': 'logout' }, body: '{}' }) }
  finally { clearSession() }
}

export async function restoreSession() {
  await refreshSession()
}
