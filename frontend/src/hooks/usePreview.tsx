import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Appointment, Room } from '../types'

export async function api<T = void>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch('/api/' + path, {
    method,
    cache: 'no-store',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Không thể kết nối với máy chủ Trohn.')
  }
  const text = await response.text()
  return text ? JSON.parse(text) : undefined
}
type Account = { id: string; name: string; role: string; phone: string }
type Campus = { id: string; name: string; short: string; campus: string; lat: number; lng: number }
export type ManagedRoom = Room & {
  ownerId: string
  status: string
  description: string
  reason?: string
}
export type ManagedUser = {
  id: string
  name: string
  email: string
  role: 'Chủ trọ' | 'Khách thuê' | 'Admin'
  status: 'Hoạt động' | 'Đã khóa'
  reason?: string
  version: number
}
type Data = {
  account: Account | null
  listings: ManagedRoom[]
  universities: Campus[]
  favorites: string[]
  appointments: Appointment[]
  users?: ManagedUser[]
  logs?: { id: number; text: string; time: string }[]
}
function useData() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [toast, notify] = useState('')
  const generation = useRef(0)
  const refresh = useCallback(async () => {
    const n = ++generation.current
    try {
      const result = await api<Data>('state')
      if (n === generation.current) {
        setData(result)
        setError('')
      }
    } catch (e) {
      if (n === generation.current) setError((e as Error).message)
      throw e
    }
  }, [])
  useEffect(() => {
    void refresh().catch(() => {})
    const focus = () => void refresh().catch(() => {})
    window.addEventListener('focus', focus)
    return () => window.removeEventListener('focus', focus)
  }, [refresh])
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => notify(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])
  const catalog = useMemo(() => {
    const rooms = (data?.listings ?? [])
      .filter((r) => r.code === 'DANG_HIEN_THI')
      .map((r) => ({ ...r }))
    const roomCampuses: { roomId: string; campusId: string; distanceKm: number }[] = []
    for (const room of rooms) {
      if (room.lat == null || room.lng == null) continue
      let nearest = Infinity
      for (const campus of data?.universities ?? []) {
        const rad = Math.PI / 180
        const a =
          Math.sin(((room.lat - campus.lat) * rad) / 2) ** 2 +
          Math.cos(room.lat * rad) *
            Math.cos(campus.lat * rad) *
            Math.sin(((room.lng - campus.lng) * rad) / 2) ** 2
        const km = 12742 * Math.asin(Math.min(1, Math.sqrt(a)))
        roomCampuses.push({ roomId: room.id, campusId: campus.id, distanceKm: km })
        if (km < nearest) {
          nearest = km
          room.school = campus.name
          room.distance = km.toFixed(1) + ' km'
        }
      }
    }
    return {
      rooms,
      roomCampuses,
      districts: [...new Set(rooms.map((r) => r.district).filter(Boolean))].sort(),
    }
  }, [data])
  async function mutate<T = void>(path: string, method = 'POST', body?: unknown) {
    const value = await api<T>(path, method, body)
    await refresh()
    return value
  }
  async function act(path: string, method: string, body?: unknown) {
    try {
      await mutate(path, method, body)
      return true
    } catch (e) {
      notify((e as Error).message)
      return false
    }
  }
  return {
    ...catalog,
    data,
    error,
    refresh,
    account: data?.account,
    user: data?.account?.name ?? null,
    universities: data?.universities ?? [],
    favorites: data?.favorites ?? [],
    appointments: data?.appointments ?? [],
    toast,
    notify,
    mutate,
    act,
    toggleFavorite: (id: string) =>
      act('favorites/' + id, data?.favorites.includes(id) ? 'DELETE' : 'PUT'),
    addAppointment: async (b: Omit<Appointment, 'id' | 'status'>) =>
      (await mutate<{ id: string }>('appointments', 'POST', b)).id,
    cancelAppointment: (id: string, reason: string) =>
      act('appointments/' + id, 'POST', { status: 'cancelled', reason }),
    signOut: () => act('logout', 'POST', {}),
  }
}
const Context = createContext<ReturnType<typeof useData> | null>(null)
export function PreviewProvider({ children }: { children: ReactNode }) {
  const state = useData()
  if (state.error)
    return (
      <main className="container section" role="alert">
        <h1>Chưa tải được dữ liệu Trohn</h1>
        <p>{state.error}</p>
        <button
          className="button button-primary"
          onClick={() => void state.refresh().catch(() => {})}
        >
          Thử lại
        </button>
      </main>
    )
  if (!state.data)
    return (
      <p className="container section" role="status">
        Đang tải dữ liệu…
      </p>
    )
  return <Context.Provider value={state}>{children}</Context.Provider>
}
export function usePreview() {
  const value = useContext(Context)
  if (!value) throw new Error('Thiếu kết nối dữ liệu Trohn')
  return value
}
