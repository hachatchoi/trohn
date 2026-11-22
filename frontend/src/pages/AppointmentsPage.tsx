import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  X,
} from 'lucide-react'
import { formatDate, statusLabels } from '../assets/preview'
import { EmptyState, Modal } from '../components/UI'
import { usePreview } from '../hooks/usePreview'
import type { Appointment, AppointmentStatus } from '../types'

function canCancel(item: Appointment) {
  return (
    ['confirmed', 'pending'].includes(item.status) &&
    new Date(`${item.date}T${item.time}:00+07:00`) > new Date()
  )
}
function CancelDialog({ appointment, close }: { appointment: Appointment; close: () => void }) {
  const { data } = usePreview()
  const rooms = data!.listings
  const { cancelAppointment } = usePreview()
  const [reason, setReason] = useState('')
  const [other, setOther] = useState('')
  const room = rooms.find((item) => item.id === appointment.roomId)!
  return (
    <Modal title="Hủy lịch xem phòng?" onClose={close}>
      <div className="cancel-intro">
        <div className="cancel-icon">
          <CalendarDays size={25} />
        </div>
        <p>
          Bạn đang hủy lịch xem <strong>{room.title}</strong> vào {appointment.time}, ngày{' '}
          {formatDate(appointment.date)}.
        </p>
      </div>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          if (
            await cancelAppointment(appointment.id, reason === 'Lý do khác' ? other.trim() : reason)
          )
            close()
        }}
      >
        <fieldset className="cancel-reasons">
          <legend>
            Cho chúng mình biết lý do nhé <span>*</span>
          </legend>
          {[
            'Thay đổi kế hoạch cá nhân',
            'Đã tìm được phòng phù hợp',
            'Thời gian chưa thuận tiện',
            'Lý do khác',
          ].map((item) => (
            <label className="radio-row" key={item}>
              <input
                required
                type="radio"
                name="cancel-reason"
                value={item}
                checked={reason === item}
                onChange={() => setReason(item)}
              />
              {item}
            </label>
          ))}
        </fieldset>
        {reason === 'Lý do khác' && (
          <label className="field">
            Lý do cụ thể
            <textarea
              autoFocus
              required
              value={other}
              onChange={(event) => setOther(event.target.value)}
              placeholder="Nhập lý do hủy lịch..."
              rows={3}
              maxLength={300}
            />
          </label>
        )}
        <div className="modal-actions">
          <button className="button button-outline" type="button" onClick={close}>
            Giữ lại lịch
          </button>
          <button
            className="button button-danger"
            type="submit"
            disabled={!reason || (reason === 'Lý do khác' && !other.trim())}
          >
            Xác nhận hủy lịch
          </button>
        </div>
      </form>
    </Modal>
  )
}
export function AppointmentsPage() {
  const { data } = usePreview()
  const rooms = data!.listings
  const { appointments } = usePreview()
  const [tab, setTab] = useState<'all' | AppointmentStatus>('all')
  const [cancel, setCancel] = useState<Appointment | null>(null)
  const filtered = appointments.filter((item) => tab === 'all' || item.status === tab)
  return (
    <div className="container account-page">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight size={13} />
        <span>Lịch hẹn của tôi</span>
      </div>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">SẮP XẾP MỘT CUỘC HẸN</span>
          <h1>
            Hẹn gặp chốn về mới<span className="title-dot">.</span>
          </h1>
          <p>Theo dõi lịch xem phòng và dành thời gian cho những nơi bạn thích.</p>
        </div>
        <Link className="button button-primary" to="/tim-phong">
          <Plus size={18} />
          Tìm thêm phòng
        </Link>
      </div>
      <div className="appointment-stats">
        <div>
          <span className="stat-icon">
            <CalendarDays size={22} />
          </span>
          <div>
            <strong>{appointments.filter(canCancel).length.toString().padStart(2, '0')}</strong>
            <span>Lịch hẹn sắp tới</span>
          </div>
        </div>
        <div>
          <span className="stat-icon amber">
            <Clock3 size={22} />
          </span>
          <div>
            <strong>
              {appointments
                .filter((item) => item.status === 'pending')
                .length.toString()
                .padStart(2, '0')}
            </strong>
            <span>Đang chờ xác nhận</span>
          </div>
        </div>
        <div>
          <span className="stat-icon green">
            <Check size={22} />
          </span>
          <div>
            <strong>
              {appointments
                .filter((item) => item.status === 'confirmed')
                .length.toString()
                .padStart(2, '0')}
            </strong>
            <span>Chủ trọ đã xác nhận</span>
          </div>
        </div>
      </div>
      <div className="tabs appointment-tabs" role="tablist" aria-label="Trạng thái lịch hẹn">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            className={item === tab ? 'selected' : ''}
            onClick={() => setTab(item)}
          >
            {item === 'all' ? 'Tất cả lịch hẹn' : statusLabels[item]}
            <span>{appointments.filter((a) => item === 'all' || a.status === item).length}</span>
          </button>
        ))}
      </div>
      <div className="appointment-list">
        {filtered.length ? (
          filtered.map((item) => {
            const room = rooms.find((room) => room.id === item.roomId)!
            return (
              <article
                key={item.id}
                className={`appointment-card ${item.status === 'cancelled' ? 'is-cancelled' : ''}`}
              >
                <Link className="appointment-image" to={`/phong/${room.id}`}>
                  <img src={room.image} alt={room.title} />
                </Link>
                <div className="appointment-content">
                  <div className="appointment-card-top">
                    <span className={`status status-${item.status}`}>
                      {statusLabels[item.status]}
                    </span>
                    <span className="small muted">#{item.id}</span>
                  </div>
                  <h3>
                    <Link to={`/lich-hen/${item.id}`}>{room.title}</Link>
                  </h3>
                  <p className="inline-icon muted">
                    <MapPin size={15} />
                    {room.district}, Hà Nội
                  </p>
                  <div className="appointment-time">
                    <span>
                      <CalendarDays size={17} />
                      {formatDate(item.date)}
                    </span>
                    <span>
                      <Clock3 size={17} />
                      {item.time}
                    </span>
                  </div>
                </div>
                <div className="appointment-buttons">
                  <Link className="button button-outline" to={`/lich-hen/${item.id}`}>
                    Xem chi tiết
                    <ArrowRight size={16} />
                  </Link>
                  {canCancel(item) && (
                    <button className="plain-button cancel-link" onClick={() => setCancel(item)}>
                      Hủy lịch hẹn
                    </button>
                  )}
                </div>
              </article>
            )
          })
        ) : (
          <EmptyState
            type="calendar"
            title="Chưa có lịch hẹn ở đây"
            text="Khi tìm được một căn phòng ưng ý, bạn có thể chọn thời gian đến xem trực tiếp."
            action="Khám phá phòng trọ"
            to="/tim-phong"
          />
        )}
      </div>
      <div className="soft-banner">
        <Info size={20} />
        <span>Bạn có thể theo dõi lịch hẹn tại đây.</span>
      </div>
      {cancel && <CancelDialog appointment={cancel} close={() => setCancel(null)} />}
    </div>
  )
}
export function AppointmentDetailPage() {
  const { data } = usePreview()
  const rooms = data!.listings
  const { id } = useParams()
  const { appointments } = usePreview()
  const item = appointments.find((appointment) => appointment.id === id)
  const [cancel, setCancel] = useState(false)
  const [phone, setPhone] = useState(false)
  const room = rooms.find((room) => room.id === item?.roomId)
  if (!item || !room)
    return (
      <EmptyState
        type="calendar"
        title="Không tìm thấy lịch hẹn"
        text="Kiểm tra lại danh sách lịch hẹn của bạn."
        action="Xem danh sách lịch"
        to="/lich-hen"
      />
    )
  return (
    <div className="container appointment-detail-page">
      <Link className="text-link" to="/lich-hen">
        <ArrowLeft size={17} />
        Tất cả lịch hẹn
      </Link>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">LỊCH XEM PHÒNG #{item.id}</span>
          <h1>Chi tiết cuộc hẹn.</h1>
        </div>
        <span className={`status status-${item.status}`}>{statusLabels[item.status]}</span>
      </div>
      <div className={`appointment-status-banner ${item.status}`}>
        <span>
          {item.status === 'cancelled' ? (
            <X size={24} />
          ) : item.status === 'confirmed' ? (
            <Check size={24} />
          ) : (
            <Clock3 size={24} />
          )}
        </span>
        <div>
          <strong>
            {item.status === 'pending'
              ? 'Chủ trọ đang chờ xác nhận lịch của bạn'
              : item.status === 'confirmed'
                ? 'Cuộc hẹn đã được chủ trọ xác nhận'
                : 'Lịch hẹn này đã được hủy'}
          </strong>
          <p>
            {item.status === 'pending'
              ? 'Bạn có thể theo dõi trạng thái tại đây.'
              : item.status === 'confirmed'
                ? 'Nhớ đến đúng giờ và liên hệ chủ trọ khi bạn tới nhé.'
                : `Lý do: ${item.cancelReason || 'Thay đổi kế hoạch'}`}
          </p>
        </div>
      </div>
      <div className="appointment-detail-grid">
        <section className="panel appointment-info">
          <h2>Thông tin lịch hẹn</h2>
          <div className="info-grid">
            <div>
              <CalendarDays size={21} />
              <span>
                Ngày xem phòng<strong>{formatDate(item.date)}</strong>
              </span>
            </div>
            <div>
              <Clock3 size={21} />
              <span>
                Thời gian<strong>{item.time}</strong>
              </span>
            </div>
            <div>
              <MapPin size={21} />
              <span>
                Địa điểm<strong>{room.address}</strong>
              </span>
            </div>
            <div>
              <Phone size={21} />
              <span>
                Liên hệ của bạn
                <strong>
                  {item.name} · {item.phone}
                </strong>
              </span>
            </div>
          </div>
          <div className="appointment-note">
            <h3>
              <MessageSquare size={17} />
              Lời nhắn của bạn
            </h3>
            <p>{item.note || 'Bạn chưa để lại lời nhắn cho chủ trọ.'}</p>
          </div>
          <div className="owner-detail">
            <div className="owner-card">
              <span className="owner-avatar">L</span>
              <div>
                <strong>{room.contact}</strong>
                <span>Chủ trọ</span>
              </div>
            </div>
            <button className="button button-outline button-small" onClick={() => setPhone(!phone)}>
              <Phone size={15} />
              {phone ? room.phone : 'Xem số liên hệ'}
            </button>
          </div>
          {canCancel(item) && (
            <div className="cancel-section">
              <p className="muted">Có thay đổi trong kế hoạch của bạn?</p>
              <button className="button button-danger-outline" onClick={() => setCancel(true)}>
                Hủy lịch xem phòng
              </button>
            </div>
          )}
        </section>
        <aside className="panel detail-room-summary">
          <img src={room.image} alt={room.title} />
          <div>
            <span className="pill">{room.type}</span>
            <h3>{room.title}</h3>
            <p className="inline-icon muted">
              <MapPin size={15} />
              {room.district}, Hà Nội
            </p>
            <Link className="text-link" to={`/phong/${room.id}`}>
              Xem lại căn phòng
              <ArrowRight size={17} />
            </Link>
          </div>
        </aside>
      </div>
      {cancel && <CancelDialog appointment={item} close={() => setCancel(false)} />}
    </div>
  )
}
