import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronRight, Heart } from 'lucide-react'

import { usePreview } from '../hooks/usePreview'
import { EmptyState, RoomCard } from '../components/UI'

export function FavoritesPage() {
  const { rooms } = usePreview()
  const { favorites } = usePreview()
  const [type, setType] = useState('Tất cả')
  const saved = rooms.filter((room) => favorites.includes(room.id))
  const filtered = saved.filter((room) => type === 'Tất cả' || room.type === type)
  return (
    <div className="container account-page">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight size={13} />
        <span>Phòng yêu thích</span>
      </div>
      <div className="page-title-row">
        <div>
          <h1>
            Phòng yêu thích
          </h1>
        </div>
        <div className="page-emblem">
          <Heart size={36} strokeWidth={1.3} />
        </div>
      </div>
      <div className="tab-toolbar">
        <div className="tabs" role="tablist" aria-label="Lọc phòng yêu thích">
          {['Tất cả', 'Phòng trọ', 'Studio', 'Chung cư mini'].map((item) => (
            <button
              role="tab"
              aria-selected={type === item}
              className={type === item ? 'selected' : ''}
              onClick={() => setType(item)}
              key={item}
            >
              {item}
              {item === 'Tất cả' && <span>{saved.length}</span>}
            </button>
          ))}
        </div>
        <Link className="text-link" to="/tim-phong">
          Khám phá thêm <ArrowUpRight size={17} />
        </Link>
      </div>
      {filtered.length ? (
        <div className="room-grid favorites-grid">
          {filtered.map((room) => (
            <RoomCard room={room} key={room.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          type="heart"
          title={saved.length ? 'Chưa lưu loại phòng này' : 'Chưa có phòng yêu thích'}
          text="Bấm biểu tượng trái tim trên tin phòng để lưu."
          action="Khám phá phòng trọ"
          to="/tim-phong"
        />
      )}
    </div>
  )
}
