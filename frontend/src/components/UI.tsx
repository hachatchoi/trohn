import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  Heart,
  MapPin,
  Maximize2,
  MoveRight,
  Search,
  X,
} from 'lucide-react'
import type { Room } from '../types'
import { formatPrice } from '../assets/preview'
import { usePreview } from '../hooks/usePreview'

export function Logo({ light = false, admin = false }: { light?: boolean; admin?: boolean }) {
  return (
    <Link
      to={admin ? '/admin' : '/'}
      className={`logo ${light ? 'logo-light' : ''}`}
      aria-label={admin ? 'TROHN — Tổng quan quản trị' : 'TROHN — Trang chủ'}
    >
      <span className="logo-mark">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="m5 15 11-9 11 9M9 13v14h14V13M14 27v-9h6"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
        </svg>
        <i />
      </span>
      <span>
        trohn<span className="logo-dot">.</span>
      </span>
    </Link>
  )
}
export function RoomCard({ room }: { room: Room }) {
  const { favorites, toggleFavorite } = usePreview()
  const saved = favorites.includes(room.id)
  return (
    <article className="room-card">
      <div className="room-photo">
        <Link to={`/phong/${room.id}`} tabIndex={-1} aria-hidden="true">
          <img src={room.image} alt={room.title} loading="lazy" />
        </Link>
        {room.tag && <span className="photo-tag">{room.tag}</span>}
        <button
          className={`heart-button ${saved ? 'saved' : ''}`}
          aria-label={`${saved ? 'Bỏ lưu' : 'Lưu'} ${room.title}`}
          aria-pressed={saved}
          onClick={() => toggleFavorite(room.id)}
        >
          <Heart size={19} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="room-card-body">
        <div className="room-location">
          <MapPin size={14} />
          {[room.district, room.city].filter(Boolean).join(', ')} <span>{room.type}</span>
        </div>
        <h3>
          <Link to={`/phong/${room.id}`}>{room.title}</Link>
        </h3>
        <div className="room-meta">
          <span>
            <Maximize2 size={14} />
            {room.area} m²
          </span>
          <span>•</span>
          <span>{room.amenities.slice(0, 2).join(' · ')}</span>
        </div>
        {room.school && (
          <div className="card-campus">
            <GraduationCap size={15} />
            <span>{room.school}</span>
            <small>{room.distance} · đường chim bay</small>
          </div>
        )}
        <div className="room-card-bottom">
          <div className="price">
            {formatPrice(room.price)} triệu <span>/ tháng</span>
          </div>
          <Link to={`/phong/${room.id}`} className="card-arrow" aria-label={`Xem ${room.title}`}>
            <span>Xem phòng</span>
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  )
}
export function SectionTitle({
  eyebrow,
  title,
  children,
  to,
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
  to?: string
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {children && <p className="muted">{children}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          Xem tất cả <ArrowRight size={17} />
        </Link>
      )}
    </div>
  )
}
export function EmptyState({
  type = 'search',
  title,
  text,
  action,
  to,
}: {
  type?: 'search' | 'heart' | 'calendar'
  title: string
  text: string
  action?: string
  to?: string
}) {
  const Icon = type === 'heart' ? Heart : type === 'calendar' ? CalendarDays : Search
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={34} strokeWidth={1.4} />
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      {action && to && (
        <Link className="button button-primary" to={to}>
          {action}
          <MoveRight size={18} />
        </Link>
      )}
    </div>
  )
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previous
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      aria-label={title}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Đóng">
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
