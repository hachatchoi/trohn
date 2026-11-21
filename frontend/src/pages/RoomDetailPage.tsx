import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  GraduationCap,
  Grid2X2,
  Heart,
  House,
  MapPin,
  Maximize2,
  Phone,
  Share2,
  ShieldCheck,
} from 'lucide-react'
import { formatPrice } from '../assets/preview'
import { EmptyState, Modal, RoomCard, SectionTitle } from '../components/UI'
import { usePreview } from '../hooks/usePreview'

export function RoomDetailPage() {
  const { rooms } = usePreview()
  const { id } = useParams()
  const room = rooms.find((item) => item.id === id)
  const { favorites, toggleFavorite, notify } = usePreview()
  const [gallery, setGallery] = useState<number | null>(null)
  const [showPhone, setShowPhone] = useState(false)
  if (!room)
    return (
      <EmptyState
        title="Không tìm thấy phòng này"
        text="Phòng có thể không còn khả dụng. Cùng khám phá những không gian khác nhé."
        action="Quay lại tìm phòng"
        to="/tim-phong"
      />
    )
  const saved = favorites.includes(room.id)
  const photos = room.images ?? []
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('Đã sao chép liên kết phòng')
    } catch {
      notify('Bạn có thể sao chép liên kết trên thanh địa chỉ')
    }
  }
  return (
    <div className="container detail-page">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight size={13} />
        <Link to="/tim-phong">Tìm phòng</Link>
        <ChevronRight size={13} />
        <Link to={`/tim-phong?district=${encodeURIComponent(room.district)}`}>{room.district}</Link>
      </div>
      <div className="detail-title-row">
        <div>
          <div className="detail-badges">
            <span className="pill">{room.type}</span>
            <span className="muted">Mã phòng: {room.id}</span>
          </div>
          <h1>{room.title}</h1>
          <p className="inline-icon muted">
            <MapPin size={17} />
            {room.address}
          </p>
        </div>
        <div className="detail-tools">
          <button className="button button-outline" onClick={share}>
            <Share2 size={17} />
            <span>Chia sẻ</span>
          </button>
          <button
            className={`button button-outline ${saved ? 'favorited' : ''}`}
            onClick={() => toggleFavorite(room.id)}
            aria-pressed={saved}
          >
            <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
            <span>{saved ? 'Đã lưu' : 'Lưu phòng'}</span>
          </button>
        </div>
      </div>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <button
            key={index}
            className={`photo-grid-item photo-${index}`}
            onClick={() => setGallery(index)}
            aria-label={`Xem ảnh phòng ${index + 1}`}
          >
            <img
              src={photo}
              alt={
                index === 0
                  ? room.title
                  : ['Không gian phòng', 'Góc phòng ngủ', 'Khu vực bếp', 'Góc học tập'][index - 1]
              }
              loading={index ? 'lazy' : 'eager'}
            />
            {index === 4 && (
              <span className="view-photos">
                <Grid2X2 size={17} />
                Xem tất cả ảnh
              </span>
            )}
            {index === 0 && (
              <span className="photo-expand">
                <Expand size={19} />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="detail-columns">
        <div className="detail-main">
          <div className="room-facts">
            <div>
              <Maximize2 size={23} />
              <span>
                Diện tích<strong>{room.area} m²</strong>
              </span>
            </div>
            <div>
              <House size={23} />
              <span>
                Loại phòng<strong>{room.type}</strong>
              </span>
            </div>

            <div>
              <GraduationCap size={23} />
              <span>
                Gần trường<strong>{room.distance}</strong>
              </span>
            </div>
          </div>
          <section className="detail-section">
            <h2>Một chút về căn phòng</h2>
            <p>{room.description}</p>
          </section>
          <section className="detail-section">
            <h2>Tiện ích của phòng</h2>
            <div className="amenity-grid">
              {room.amenities.map((text) => (
                <div key={text}>{text}</div>
              ))}
            </div>
          </section>
          <section className="detail-section">
            <h2>Các khoản chi phí</h2>
            <div className="cost-table">
              <div>
                <span>Tiền thuê phòng</span>
                <strong>{formatPrice(room.price)} triệu / tháng</strong>
              </div>
              {room.costs?.map((c) => (
                <div key={c.label}>
                  <span>{c.label}</span>
                  <strong>
                    {c.amount.toLocaleString('vi-VN')} đ / {c.unit}
                  </strong>
                </div>
              ))}
            </div>
            <p className="small muted">
              Bạn nên xác nhận lại chi phí và các điều khoản với chủ trọ khi xem phòng.
            </p>
          </section>
          <section className="detail-section">
            <h2>Khu vực xung quanh</h2>
            <p className="inline-icon muted">
              <MapPin size={16} />
              {room.address}
            </p>
            {room.school && (
              <p>
                {room.school} · {room.distance}
              </p>
            )}
          </section>
        </div>
        <aside className="booking-aside">
          <div className="booking-box">
            <span className="eyebrow">KHÔNG GIAN DÀNH CHO BẠN</span>
            <div className="detail-price">
              {formatPrice(room.price)} triệu <span>/ tháng</span>
            </div>
            <p className="muted">Một căn phòng mới, nhiều điều để mong chờ.</p>
            <div className="booking-benefits">
              <span>
                <Check size={16} />
                Xem phòng trước khi quyết định
              </span>
              <span>
                <Check size={16} />
                Chủ động chọn thời gian phù hợp
              </span>
            </div>
            <Link className="button button-primary full-width" to={`/dat-lich/${room.id}`}>
              <CalendarDays size={18} />
              Đặt lịch xem phòng
              <ArrowRight size={18} />
            </Link>
            <button
              className="button button-outline full-width"
              onClick={() => setShowPhone(!showPhone)}
            >
              <Phone size={17} />
              {showPhone ? room.phone : 'Xem số điện thoại chủ trọ'}
            </button>
            <p className="booking-hint">Bạn chưa cần thanh toán khi đặt lịch.</p>
            <div className="owner-card">
              <span className="owner-avatar">{room.contact?.[0]}</span>
              <div>
                <strong>{room.contact}</strong>
                <span>Chủ trọ</span>
              </div>
              <ShieldCheck size={21} />
            </div>
          </div>
          <div className="viewing-tip">
            <span>✳</span>
            <p>
              <strong>Đi xem phòng, nhớ nhé!</strong>
              <br />
              Kiểm tra ánh sáng, thiết bị và hỏi rõ những chi phí hàng tháng.
            </p>
          </div>
        </aside>
      </div>
      <section className="section">
        <SectionTitle title="Thêm vài nơi bạn có thể thích" to="/tim-phong" />
        <div className="room-grid">
          {rooms
            .filter((item) => item.id !== room.id)
            .slice(0, 3)
            .map((item) => (
              <RoomCard key={item.id} room={item} />
            ))}
        </div>
      </section>
      <Link className="text-link back-link" to="/tim-phong">
        <ArrowLeft size={17} />
        Quay lại danh sách phòng
      </Link>
      {gallery !== null && (
        <Modal
          title={`Không gian phòng · ${gallery + 1}/${photos.length}`}
          wide
          onClose={() => setGallery(null)}
        >
          <div className="gallery-view">
            <img src={photos[gallery]} alt={`Ảnh phòng ${gallery + 1}`} />
            <button
              className="gallery-prev"
              aria-label="Ảnh trước"
              onClick={() => setGallery((gallery + photos.length - 1) % photos.length)}
            >
              <ChevronLeft />
            </button>
            <button
              className="gallery-next"
              aria-label="Ảnh tiếp theo"
              onClick={() => setGallery((gallery + 1) % photos.length)}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="gallery-thumbs">
            {photos.map((photo, index) => (
              <button
                className={index === gallery ? 'active' : ''}
                onClick={() => setGallery(index)}
                key={index}
                aria-label={`Chọn ảnh ${index + 1}`}
              >
                <img src={photo} alt="" />
              </button>
            ))}
          </div>
        </Modal>
      )}
      <div className="mobile-booking-bar">
        <div>
          <strong>{formatPrice(room.price)} triệu</strong>
          <span>/ tháng</span>
        </div>
        <Link className="button button-primary" to={`/dat-lich/${room.id}`}>
          Đặt lịch xem
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}
