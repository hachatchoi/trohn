export type Room = {
  id: string
  title: string
  district: string
  address: string
  price: number
  area: number
  type: 'Studio' | 'Phòng trọ' | 'Chung cư mini'
  image: string
  school: string
  distance: string
  amenities: string[]
  tag?: string
  code?: string
  ward?: string
  city?: string
  lat?: number | null
  lng?: number | null
  version?: number
  phone?: string
  contact?: string
  description?: string
  images?: string[]
  costs?: { label: string; amount: number; unit: string }[]
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected'
export type Appointment = {
  id: string
  roomId: string
  date: string
  time: string
  name: string
  phone: string
  note: string
  status: AppointmentStatus
  cancelReason?: string
}
