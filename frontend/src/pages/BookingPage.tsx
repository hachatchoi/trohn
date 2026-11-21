import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { formatDate, formatPrice, futureDate } from '../assets/preview'
import { EmptyState } from '../components/UI'
import { usePreview } from '../hooks/usePreview'

export function BookingPage() {
  const { rooms } = usePreview()
  const { id } = useParams()
  const room = rooms.find((item) => item.id === id)
  const { addAppointment, user, account } = usePreview()
  const navigate = useNavigate()
  const [date, setDate] = useState(futureDate(1))
  const [time, setTime] = useState('09:00')
  const name = user || ''
  const [phone, setPhone] = useState(account?.phone || '')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  if (!user)
    return (
      <EmptyState
        title="Đăng nhập để đặt lịch"
        text="Chủ trọ sẽ nhận lịch hẹn từ tài khoản của bạn."
        action="Đăng nhập"
        to="/dang-nhap"
      />
    )
  if (!room)
    return (
      <EmptyState
        title="Phòng không khả dụng"
        text="Hãy chọn một phòng khác để đặt lịch xem nhé."
        action="Tìm phòng"
        to="/tim-phong"
      />
    )
  return (
    <div className="container booking-page">
      <div className="breadcrumb">
        <Link to="/tim-phong">Tìm phòng</Link>
        <ChevronRight size={13} />
        <Link to={`/phong/${room.id}`}>Chi tiết phòng</Link>
        <ChevronRight size={13} />
        <span>Đặt lịch xem</span>
      </div>
      <Link className="text-link" to={`/phong/${room.id}`}>
        <ArrowLeft size={16} />
        Quay lại căn phòng
      </Link>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">GẦN HƠN VỚI CHỐN VỀ MỚI</span>
          <h1>Hẹn một buổi xem phòng.</h1>
          <p>Chọn thời gian phù hợp. Chủ trọ sẽ xác nhận lịch hẹn của bạn.</p>
        </div>
      </div>
      <div className="booking-layout">
        <form
          className="booking-form panel"
          onSubmit={async (event) => {
            event.preventDefault()
            if (new Date(`${date}T${time}`) <= new Date()) {
              setError('Hãy chọn thời gian xem phòng ở tương lai.')
              return
            }
            if (!/^0\d{9}$/.test(phone)) {
              setError('Số điện thoại cần có 10 chữ số và bắt đầu bằng 0.')
              return
            }
            if (!name.trim()) {
              setError('Bạn hãy nhập họ tên để chủ trọ tiện liên hệ.')
              return
            }
            try {
              const appointmentId = await addAppointment({
                roomId: room.id,
                date,
                time,
                name: name.trim(),
                phone,
                note,
              })
              navigate(`/dat-lich/thanh-cong?lich=${appointmentId}`)
            } catch (e) {
              setError((e as Error).message)
            }
          }}
        >
          <div className="form-section">
            <h2>
              <span className="step-number">01</span>Chọn thời gian xem phòng
            </h2>
            <label className="field">
              Ngày bạn muốn đến xem
              <input
                type="date"
                required
                min={futureDate(0)}
                max={futureDate(30)}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <fieldset className="time-fieldset">
              <legend>Khung giờ phù hợp</legend>
              <div className="time-slots">
                {['08:00', '09:00', '10:30', '14:00', '15:30', '17:00'].map((slot) => (
                  <button
                    className={slot === time ? 'selected' : ''}
                    type="button"
                    key={slot}
                    onClick={() => setTime(slot)}
                    aria-pressed={slot === time}
                  >
                    <Clock3 size={15} />
                    {slot}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="small muted">Giờ Việt Nam. Bạn có thể chọn lịch trong 30 ngày tới.</p>
          </div>
          <div className="form-section">
            <h2>
              <span className="step-number">02</span>Thông tin liên hệ
            </h2>
            <div className="form-grid">
              <label className="field">
                Họ và tên <span>*</span>
                <input
                  required
                  autoComplete="name"
                  placeholder="Tên của bạn"
                  value={name}
                  readOnly
                  maxLength={80}
                />
              </label>
              <label className="field">
                Số điện thoại <span>*</span>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Số để chủ trọ liên hệ"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  maxLength={10}
                />
              </label>
            </div>
            <label className="field">
              Lời nhắn cho chủ trọ <span className="optional">(không bắt buộc)</span>
              <textarea
                rows={3}
                placeholder="Bạn muốn hỏi thêm điều gì về căn phòng?"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
              />
            </label>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="booking-form-bottom">
            <div className="inline-icon muted small">
              <ShieldCheck size={18} />
              Không thanh toán hay giữ chỗ tại bước này.
            </div>
            <button className="button button-primary" type="submit">
              Gửi yêu cầu xem phòng
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
        <aside>
          <div className="booking-summary panel">
            <img className="summary-image" src={room.image} alt={room.title} />
            <div className="summary-body">
              <span className="pill">{room.type}</span>
              <h3>{room.title}</h3>
              <p className="inline-icon muted">
                <MapPin size={15} />
                {room.district}, Hà Nội
              </p>
              <div className="price">
                {formatPrice(room.price)} triệu <span>/ tháng</span>
              </div>
              <hr />
              <div className="summary-row">
                <CalendarDays size={19} />
                <div>
                  <span>Ngày xem phòng</span>
                  <strong>{date ? formatDate(date) : 'Chưa chọn ngày'}</strong>
                </div>
              </div>
              <div className="summary-row">
                <Clock3 size={19} />
                <div>
                  <span>Thời gian</span>
                  <strong>{time}</strong>
                </div>
              </div>
              <div className="owner-card">
                <span className="owner-avatar">L</span>
                <div>
                  <strong>{room.contact}</strong>
                  <span>Chủ trọ</span>
                </div>
              </div>
            </div>
          </div>
          <div className="booking-info">
            <Info size={20} />
            <p>
              Lịch hẹn cần được chủ trọ xác nhận. Bạn có thể theo dõi và hủy lịch trong{' '}
              <Link to="/lich-hen">Lịch hẹn của tôi</Link>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export function BookingSuccessPage() {
  const { data } = usePreview()
  const rooms = data!.listings
  const [params] = useSearchParams()
  const { appointments } = usePreview()
  const appointment = appointments.find((item) => item.id === params.get('lich'))
  const room = rooms.find((item) => item.id === appointment?.roomId)
  if (!appointment || !room)
    return (
      <EmptyState
        type="calendar"
        title="Cùng sắp xếp một buổi xem phòng"
        text="Chọn căn phòng bạn thích để bắt đầu đặt lịch."
        action="Khám phá phòng trọ"
        to="/tim-phong"
      />
    )
  return (
    <div className="container success-page">
      <div className="success-icon">
        <CheckCircle2 size={48} strokeWidth={1.4} />
      </div>
      <span className="eyebrow">MỘT BƯỚC GẦN HƠN</span>
      <h1>Lịch xem phòng đã sẵn sàng!</h1>
      <p>Lịch xem phòng đã được gửi đến chủ trọ.</p>
      <div className="success-card">
        <img src={room.image} alt={room.title} />
        <div>
          <span className="status status-pending">Chờ xác nhận</span>
          <h3>{room.title}</h3>
          <p className="inline-icon">
            <CalendarDays size={16} />
            {formatDate(appointment.date)} <span>·</span>
            <Clock3 size={16} />
            {appointment.time}
          </p>
        </div>
      </div>
      <div className="success-steps">
        <span>
          <Check size={16} />
          Đã tạo yêu cầu
        </span>
        <i />
        <span className="muted">Chờ chủ trọ xác nhận</span>
        <i />
        <span className="muted">Đến xem phòng</span>
      </div>
      <div className="button-row">
        <Link className="button button-primary" to={`/lich-hen/${appointment.id}`}>
          Xem lịch hẹn
          <ArrowRight size={17} />
        </Link>
        <Link className="button button-outline" to="/tim-phong">
          Tìm thêm phòng
        </Link>
      </div>
    </div>
  )
}
