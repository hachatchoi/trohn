import { useState } from 'react'
import { Link, NavLink, Outlet, useOutletContext, useNavigate, useParams } from 'react-router-dom'
import {
  Plus,
  LayoutDashboard,
  Building2,
  CalendarDays,
  ArrowUpRight,
  Eye,
  Pencil,
  ArrowLeft,
} from 'lucide-react'
import { formatDate, statusLabels } from '../assets/preview'
import { Logo, EmptyState, Modal } from '../components/UI'
import { Navigate } from 'react-router-dom'
import { usePreview } from '../hooks/usePreview'
import type { Room } from '../types'

type Listing = Room & { status: string; description: string; reason?: string; images?: string[] }
type Visit = {
  phone: string
  id: string
  roomId: string
  name: string
  date: string
  time: string
  status: string
  note: string
  reason?: string
}
type Context = {
  listings: Listing[]
  visits: Visit[]
}
const statuses = ['Đang hiển thị', 'Chờ duyệt', 'Đã ẩn', 'Bị từ chối']
export function LandlordLayout() {
  const { data, account, appointments, signOut, toast } = usePreview()
  if (account?.role !== 'CHU_TRO') return <Navigate to="/dang-nhap" replace />
  const listings = data!.listings.filter((r) => r.ownerId === account.id)
  const visits = appointments.map((a) => ({
    ...a,
    status: statusLabels[a.status],
    reason: a.cancelReason,
  }))
  return (
    <div className="owner-shell">
      {toast && (
        <p role="alert" className="toast toast-visible">
          {toast}
        </p>
      )}
      <aside className="owner-sidebar">
        <Logo />
        <span className="owner-label">QUẢN LÝ CHO THUÊ</span>
        <nav>
          <NavLink end to="/chu-tro">
            <LayoutDashboard size={18} /> Tổng quan
          </NavLink>
          <NavLink to="/chu-tro/tin-dang">
            <Building2 size={18} /> Tin đăng của tôi
          </NavLink>
          <NavLink to="/chu-tro/lich-hen">
            <CalendarDays size={18} /> Lịch xem phòng
          </NavLink>
        </nav>
        <Link className="owner-sidebar-create" to="/chu-tro/tin-dang/them">
          <Plus size={17} /> Đăng tin mới
        </Link>
        <div className="owner-sidebar-note">
          <span className="owner-overline">TÀI KHOẢN CHỦ TRỌ</span>
          <strong>{account.name}</strong>
          <p>Quản lý không gian cho thuê của bạn tại Hà Nội.</p>
        </div>
        <Link to="/">↗ Xem giao diện khách thuê</Link>
        <button onClick={signOut}>Đăng xuất</button>
      </aside>
      <div className="owner-main">
        <header className="owner-header">
          <span className="owner-header-path">
            Không gian làm việc <span>/ Chủ trọ</span>
          </span>
          <span className="owner-user">
            <i>{account.name[0]}</i> {account.name} <small>Chủ trọ</small>
          </span>
        </header>
        <main className="owner-content">
          <Outlet context={{ listings, visits } satisfies Context} />
        </main>
      </div>
    </div>
  )
}
function useOwner() {
  return useOutletContext<Context>()
}
function Heading({
  title,
  text,
  action = false,
}: {
  title: string
  text: string
  action?: boolean
}) {
  return (
    <div className="owner-heading">
      <div>
        <span className="eyebrow">KHÔNG GIAN CỦA BẠN</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action && (
        <Link className="button button-primary" to="/chu-tro/tin-dang/them">
          <Plus size={17} /> Đăng tin mới
        </Link>
      )}
    </div>
  )
}
export function OwnerDashboard() {
  const { listings, visits } = useOwner()
  const waiting = visits.filter((v) => v.status === 'Chờ xác nhận')
  const rejected = listings.filter((l) => l.status === 'Bị từ chối')
  const upcoming = visits
    .filter((v) => ['Chờ xác nhận', 'Đã xác nhận'].includes(v.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  return (
    <>
      <Heading
        title="Tổng quan quản lý"
        text="Tin đăng, yêu cầu xem phòng và những việc cần xử lý."
        action
      />
      <div className="owner-stats">
        {[
          ['Tổng tin đăng', listings.length, 'Danh mục phòng của bạn'],
          [
            'Đang hiển thị',
            listings.filter((l) => l.status === 'Đang hiển thị').length,
            'Khách thuê có thể xem',
          ],
          [
            'Đang chờ duyệt',
            listings.filter((l) => l.status === 'Chờ duyệt').length,
            'Đã gửi đến quản trị viên',
          ],
          ['Lịch cần phản hồi', waiting.length, 'Chờ bạn xác nhận'],
        ].map(([title, value, note], i) => (
          <div key={title}>
            <span>
              <span className={`metric-dot metric-${i}`} />
              {title}
            </span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="owner-dashboard-grid">
        <section className="owner-work-panel">
          <div className="work-panel-heading">
            <div>
              <span className="owner-overline">ƯU TIÊN HÔM NAY</span>
              <h2>
                Cần bạn xử lý <b>{waiting.length + rejected.length}</b>
              </h2>
            </div>
          </div>
          {waiting.map((v) => (
            <Link className="owner-task" to={`/chu-tro/lich-hen/${v.id}`} key={v.id}>
              <span className="task-icon">
                <CalendarDays size={20} />
              </span>
              <div>
                <strong>{v.name} muốn xem phòng</strong>
                <p>
                  {formatDate(v.date)} · {v.time}
                </p>
                <small>{listings.find((l) => l.id === v.roomId)?.title}</small>
              </div>
              <span className="task-action">Phản hồi →</span>
            </Link>
          ))}
          {rejected.map((l) => (
            <Link className="owner-task" to={`/chu-tro/tin-dang/${l.id}/sua`} key={l.id}>
              <span className="task-icon task-warning">
                <Pencil size={20} />
              </span>
              <div>
                <strong>Tin cần bổ sung thông tin</strong>
                <p>{l.title}</p>
                <small>{l.reason}</small>
              </div>
              <span className="task-action">Sửa tin →</span>
            </Link>
          ))}
          {!waiting.length && !rejected.length && (
            <p className="owner-all-done">Bạn đã xử lý hết các yêu cầu hiện tại.</p>
          )}
        </section>
        <section className="owner-work-panel owner-pipeline">
          <div className="work-panel-heading">
            <h2>Tình trạng tin đăng</h2>
            <Building2 size={20} />
          </div>
          {statuses.map((status, i) => (
            <div className="pipeline-row" key={status}>
              <div>
                <span>
                  <i className={`metric-dot metric-${i}`} />
                  {status}
                </span>
                <strong>{listings.filter((l) => l.status === status).length}</strong>
              </div>
              <div className="pipeline-track">
                <span
                  style={{
                    width: `${listings.length ? (listings.filter((l) => l.status === status).length / listings.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
          <Link className="text-link" to="/chu-tro/tin-dang">
            Mở danh sách tin đăng <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
      <section className="owner-work-panel owner-agenda">
        <div className="work-panel-heading">
          <div>
            <span className="owner-overline">LỊCH TRÌNH</span>
            <h2>Các buổi xem phòng sắp tới</h2>
          </div>
          <Link className="text-link" to="/chu-tro/lich-hen">
            Tất cả lịch hẹn →
          </Link>
        </div>
        {upcoming.map((v) => (
          <Link className="agenda-row" key={v.id} to={`/chu-tro/lich-hen/${v.id}`}>
            <div className="agenda-date">
              <strong>{v.date.slice(8)}</strong>
              <span>THÁNG {v.date.slice(5, 7)}</span>
            </div>
            <strong className="agenda-hour">{v.time}</strong>
            <div className="agenda-person">
              <strong>{v.name}</strong>
              <p>{listings.find((l) => l.id === v.roomId)?.title}</p>
            </div>
            <span className="owner-badge" data-status={v.status}>
              {v.status}
            </span>
            <ArrowUpRight size={17} />
          </Link>
        ))}
        {!upcoming.length && <p className="owner-all-done">Chưa có buổi xem phòng sắp tới.</p>}
      </section>
    </>
  )
}
export function OwnerListings() {
  const { listings } = useOwner()
  const { act } = usePreview()
  const [filter, setFilter] = useState('Tất cả')
  const [query, setQuery] = useState('')
  const [hide, setHide] = useState<string | null>(null)
  const visible = listings.filter(
    (x) =>
      (filter === 'Tất cả' || x.status === filter) &&
      x.title.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      <Heading
        title="Tin đăng của tôi."
        text="Theo dõi trạng thái và cập nhật thông tin những căn phòng của bạn."
        action
      />
      <div className="owner-status-tabs" aria-label="Lọc tin đăng">
        {['Tất cả', ...statuses].map((s) => (
          <button key={s} aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s}
            <span>
              {s === 'Tất cả' ? listings.length : listings.filter((l) => l.status === s).length}
            </span>
          </button>
        ))}
      </div>
      <div className="owner-tools">
        <input
          aria-label="Tìm tin đăng"
          placeholder="Tìm theo tên tin đăng…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Trạng thái tin đăng"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {['Tất cả', ...statuses].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="owner-list-caption">
        <span>THÔNG TIN PHÒNG</span>
        <span>TRẠNG THÁI & THAO TÁC</span>
      </div>
      <div className="owner-listings">
        {visible.map((room) => (
          <article className="owner-listing" key={room.id}>
            <img src={room.image} alt={room.title} />
            <div>
              <span className={`owner-badge state-${statuses.indexOf(room.status)}`}>
                {room.status}
              </span>
              <h2>{room.title}</h2>
              <p>{room.address}</p>
              <strong>
                {room.price.toLocaleString('vi-VN')} triệu / tháng{' '}
                <small>
                  · {room.area} m² · {room.type}
                </small>
              </strong>
              {room.status === 'Bị từ chối' && <p className="owner-rejection">{room.reason}</p>}
              <div className="owner-card-actions">
                <Link to={`/chu-tro/tin-dang/${room.id}`}>
                  <Eye size={15} /> Xem tin
                </Link>
                <Link to={`/chu-tro/tin-dang/${room.id}/sua`}>
                  <Pencil size={15} /> Sửa tin
                </Link>
                {room.status === 'Đang hiển thị' && (
                  <button onClick={() => setHide(room.id)}>Ẩn tin</button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <EmptyState
          title="Chưa có tin đăng phù hợp"
          text="Thử thay đổi bộ lọc hoặc tạo một tin mới."
        />
      )}
      {hide && (
        <Modal title="Ẩn tin đăng này?" onClose={() => setHide(null)}>
          <p>Tin sẽ không còn hiển thị với khách thuê .</p>
          <div className="owner-card-actions">
            <button className="button button-outline" onClick={() => setHide(null)}>
              Quay lại
            </button>
            <button
              className="button button-primary"
              onClick={async () => {
                if (
                  await act('listings/' + hide + '/hide', 'POST', {
                    version: listings.find((r) => r.id === hide)?.version,
                  })
                )
                  setHide(null)
              }}
            >
              Xác nhận ẩn tin
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
export function OwnerListingDetail() {
  const { id } = useParams()
  const { listings } = useOwner()
  const room = listings.find((x) => x.id === id)
  if (!room)
    return (
      <EmptyState
        title="Không tìm thấy tin đăng"
        text="Tin không có trong danh sách."
        action="Về danh sách"
        to="/chu-tro/tin-dang"
      />
    )
  return (
    <>
      <Link className="text-link" to="/chu-tro/tin-dang">
        <ArrowLeft size={16} /> Tin đăng của tôi
      </Link>
      <Heading title={room.title} text={room.address} />
      <div className="owner-detail">
        <div>
          <img style={{ width: '100%', borderRadius: 14 }} src={room.image} alt={room.title} />
          {room.images && room.images.length > 1 && (
            <div className="owner-upload-previews">
              {room.images.slice(1).map((source, index) => (
                <img key={index} src={source} alt={`Ảnh phòng ${index + 2}`} />
              ))}
            </div>
          )}
        </div>
        <section>
          <span className="owner-badge">{room.status}</span>
          <h2>{room.price.toLocaleString('vi-VN')} triệu / tháng</h2>
          <p>
            {room.type} · {room.area} m²
          </p>
          <h3>Mô tả phòng</h3>
          <p>{room.description}</p>
          <h3>Tiện ích</h3>
          <p>{room.amenities.join(' · ')}</p>
          <Link className="button button-primary" to={`/chu-tro/tin-dang/${id}/sua`}>
            <Pencil size={16} /> Chỉnh sửa tin
          </Link>
        </section>
      </div>
    </>
  )
}
export function OwnerListingForm() {
  const { id } = useParams()
  const { listings } = useOwner()
  const { mutate } = usePreview()
  const existing = listings.find((x) => x.id === id)
  const navigate = useNavigate()
  const [images, setImages] = useState<string[]>(
    existing?.images || (existing ? [existing.image] : []),
  )
  const [imageError, setImageError] = useState('')
  const [readingImages, setReadingImages] = useState(false)
  async function chooseImages(files: FileList | null) {
    if (!files?.length) return
    setImageError('')
    const selected = Array.from(files)
    if (images.length + selected.length > 8) {
      setImageError('Mỗi tin tối đa 8 ảnh. Hãy bớt ảnh trước khi chọn thêm.')
      return
    }
    if (
      selected.some(
        (file) =>
          !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setImageError('Chỉ nhận JPG, PNG hoặc WebP, tối đa 5 MB mỗi ảnh.')
      return
    }
    setReadingImages(true)
    try {
      const previews = await Promise.all(
        selected.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onerror = () => reject(new Error('read'))
              reader.onload = () => {
                const source = String(reader.result)
                const testImage = new Image()
                testImage.onload = () => resolve(source)
                testImage.onerror = () => reject(new Error('image'))
                testImage.src = source
              }
              reader.readAsDataURL(file)
            }),
        ),
      )
      setImages((current) => [...current, ...previews])
    } catch {
      setImageError('Không đọc được ảnh. Hãy chọn lại ảnh hợp lệ.')
    } finally {
      setReadingImages(false)
    }
  }
  if (id && !existing)
    return (
      <EmptyState
        title="Không tìm thấy tin đăng"
        text="Hãy chọn một tin trong danh sách."
        action="Về danh sách"
        to="/chu-tro/tin-dang"
      />
    )
  return (
    <>
      <Link className="text-link" to="/chu-tro/tin-dang">
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>
      <Heading
        title={id ? 'Chỉnh sửa tin đăng.' : 'Tạo tin đăng'}
        text="Thông tin rõ ràng giúp người thuê dễ tìm thấy không gian phù hợp."
      />
      <form
        className="owner-form"
        onSubmit={async (e) => {
          e.preventDefault()
          if (readingImages) return
          if (!images.length) {
            setImageError('Vui lòng chọn ít nhất một ảnh phòng.')
            return
          }
          const data = new FormData(e.currentTarget)
          const item: Listing = {
            school: existing?.school || '',
            distance: existing?.distance || '',
            id: existing?.id || `tin-${Date.now()}`,
            title: String(data.get('title')).trim(),
            district: String(data.get('district')),
            address: String(data.get('address')).trim(),
            price: Number(data.get('price')),
            area: Number(data.get('area')),
            type: String(data.get('type')) as Room['type'],
            description: String(data.get('description')).trim(),
            amenities: data.getAll('amenities').map(String),
            image: images[0],
            images,
            status: 'Chờ duyệt',
          }
          try {
            const saved = await mutate<{ id: string }>('listings' + (id ? '/' + id : ''), 'POST', {
              ...item,
              ward: data.get('ward'),
              lat: data.get('lat') ? Number(data.get('lat')) : null,
              lng: data.get('lng') ? Number(data.get('lng')) : null,
              version: existing?.version,
            })
            navigate('/chu-tro/tin-dang/' + saved.id)
          } catch (e) {
            setImageError((e as Error).message)
          }
        }}
      >
        <div className="owner-form-guide">
          <strong>Chuẩn bị trước khi đăng</strong>
          <span>Thông tin phòng chính xác</span>
          <span>Giá thuê và các chi phí</span>
          <span>Ít nhất 1 ảnh thực tế</span>
        </div>
        <section className="owner-panel">
          <h2>01. Thông tin căn phòng</h2>
          <label>
            Tiêu đề tin đăng
            <input
              name="title"
              required
              maxLength={120}
              defaultValue={existing?.title}
              placeholder="Ví dụ: Studio có ban công tại Thanh Xuân"
            />
          </label>
          <div className="owner-form-grid">
            <label>
              Loại phòng
              <select name="type" required defaultValue={existing?.type || ''}>
                <option value="" disabled>
                  Chọn loại phòng
                </option>
                {['Phòng trọ', 'Studio', 'Chung cư mini'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Khu vực
              <input name="district" required defaultValue={existing?.district} />
            </label>
            <label>
              Phường / xã
              <input name="ward" required defaultValue={existing?.ward} />
            </label>
            <label>
              Vĩ độ (tùy chọn)
              <input type="number" step="any" name="lat" defaultValue={existing?.lat ?? ''} />
            </label>
            <label>
              Kinh độ (tùy chọn)
              <input type="number" step="any" name="lng" defaultValue={existing?.lng ?? ''} />
            </label>
            <label>
              Giá thuê (triệu đồng / tháng)
              <input
                name="price"
                type="number"
                min="0.1"
                step="0.1"
                required
                defaultValue={existing?.price}
                placeholder="3.5"
              />
            </label>
            <label>
              Diện tích (m²)
              <input
                name="area"
                type="number"
                min="1"
                required
                defaultValue={existing?.area}
                placeholder="28"
              />
            </label>
          </div>
          <label>
            Địa chỉ cụ thể
            <input
              name="address"
              required
              defaultValue={existing?.address}
              placeholder="Số nhà, ngõ, đường, phường…"
            />
          </label>
          <label>
            Mô tả và các chi phí
            <textarea
              name="description"
              rows={5}
              required
              defaultValue={existing?.description}
              placeholder="Mô tả phòng, tiền điện/nước, phí dịch vụ, tiền cọc và quy định…"
            />
          </label>
        </section>
        <section className="owner-panel">
          <h2>02. Tiện ích & hình ảnh</h2>
          <div className="owner-amenities">
            {[
              'Điều hòa',
              'Nóng lạnh',
              'Nội thất',
              'Bếp riêng',
              'Ban công',
              'Máy giặt',
              'Chỗ để xe',
            ].map((x) => (
              <label key={x}>
                <input
                  type="checkbox"
                  name="amenities"
                  value={x}
                  defaultChecked={existing?.amenities.includes(x)}
                />
                {x}
              </label>
            ))}
          </div>
          <label className="owner-upload">
            Chọn ảnh từ máy tính
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={readingImages}
              onChange={(event) => {
                void chooseImages(event.target.files)
                event.target.value = ''
              }}
              aria-describedby="photo-help"
            />
          </label>
          <p id="photo-help">JPG, PNG, WebP · Tối đa 8 ảnh, 5 MB/ảnh. Ảnh đầu tiên là ảnh bìa.</p>
          {readingImages && <p role="status">Đang đọc ảnh…</p>}
          {imageError && (
            <p role="alert" className="owner-photo-error">
              {imageError}
            </p>
          )}
          <div className="owner-upload-previews">
            {images.map((source, index) => (
              <div key={`${index}-${source.slice(-30)}`}>
                <img src={source} alt={`Ảnh phòng ${index + 1}`} />
                <span>{index === 0 ? 'Ảnh bìa' : `Ảnh ${index + 1}`}</span>
                <div>
                  <button
                    type="button"
                    disabled={readingImages}
                    onClick={() => setImages((all) => all.filter((_, i) => i !== index))}
                    aria-label={`Xóa ảnh ${index + 1}`}
                  >
                    Xóa ảnh
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      disabled={readingImages}
                      onClick={() =>
                        setImages((all) => [all[index], ...all.filter((_, i) => i !== index)])
                      }
                    >
                      Đặt làm ảnh bìa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="owner-form-submit">
          <p>
            Tin mới hoặc tin chỉnh sửa sẽ chuyển sang trạng thái chờ duyệt để quản trị viên xem xét.
          </p>
          <Link className="button button-outline" to="/chu-tro/tin-dang">
            Hủy thay đổi
          </Link>
          <button className="button button-primary" type="submit" disabled={readingImages}>
            {id ? 'Lưu và gửi duyệt lại' : 'Gửi tin để duyệt'}
          </button>
        </div>
      </form>
    </>
  )
}
export function OwnerVisits() {
  const { visits, listings } = useOwner()
  const [status, setStatus] = useState('Tất cả')
  return (
    <>
      <Heading
        title="Lịch xem phòng."
        text="Theo dõi yêu cầu và sắp xếp những cuộc hẹn với người thuê."
      />
      <div className="owner-tools">
        <select
          aria-label="Trạng thái lịch hẹn"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đã từ chối', 'Đã hủy'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="owner-visits">
        {visits
          .filter((v) => status === 'Tất cả' || v.status === status)
          .map((v) => (
            <Link className="owner-visit-card" key={v.id} to={`/chu-tro/lich-hen/${v.id}`}>
              <CalendarDays />
              <div>
                <h3>{v.name}</h3>
                <p>
                  {formatDate(v.date)} · {v.time}
                </p>
                <small>{listings.find((x) => x.id === v.roomId)?.title}</small>
              </div>
              <span className="owner-badge" data-status={v.status}>
                {v.status}
              </span>
              <ArrowUpRight size={18} />
            </Link>
          ))}
      </div>
      {!visits.some((v) => status === 'Tất cả' || v.status === status) && (
        <EmptyState
          title="Chưa có lịch hẹn ở trạng thái này"
          text="Các yêu cầu phù hợp sẽ xuất hiện tại đây."
        />
      )}
    </>
  )
}
export function OwnerVisitDetail() {
  const { id } = useParams()
  const { visits, listings } = useOwner()
  const { act } = usePreview()
  const visit = visits.find((v) => v.id === id)
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  if (!visit)
    return (
      <EmptyState
        title="Không tìm thấy lịch hẹn"
        text="Hãy quay lại danh sách lịch."
        action="Xem lịch hẹn"
        to="/chu-tro/lich-hen"
      />
    )
  const room = listings.find((x) => x.id === visit.roomId)
  return (
    <>
      <Link className="text-link" to="/chu-tro/lich-hen">
        <ArrowLeft size={16} /> Danh sách lịch hẹn
      </Link>
      <Heading title="Chi tiết lịch xem phòng." text={`Mã lịch hẹn ${visit.id}`} />
      <section className="owner-panel owner-appointment-detail">
        <span className="owner-badge" data-status={visit.status}>
          {visit.status}
        </span>
        <h2>{visit.name}</h2>
        <p>Liên hệ: {visit.phone}</p>
        <div className="owner-appointment-time">
          <CalendarDays />
          <strong>
            {formatDate(visit.date)} · {visit.time}
          </strong>
        </div>
        <h3>{room?.title}</h3>
        <p>{room?.address}</p>
        <h3>Lời nhắn từ khách thuê</h3>
        <p>{visit.note}</p>
        {visit.reason && <p>Lý do từ chối: {visit.reason}</p>}
        {visit.status === 'Chờ xác nhận' && (
          <div className="owner-card-actions">
            <button className="button button-primary" onClick={() => setAction('Đã xác nhận')}>
              Xác nhận lịch hẹn
            </button>
            <button className="button button-outline" onClick={() => setAction('Đã từ chối')}>
              Từ chối lịch hẹn
            </button>
          </div>
        )}
      </section>
      {action && (
        <Modal
          title={action === 'Đã xác nhận' ? 'Xác nhận lịch xem phòng?' : 'Từ chối lịch xem phòng'}
          onClose={() => setAction('')}
        >
          <p>
            {visit.name} · {formatDate(visit.date)} · {visit.time}
          </p>
          {action === 'Đã từ chối' && (
            <label className="owner-reason">
              Lý do từ chối
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Khung giờ này chủ trọ không có mặt"
                rows={3}
              />
            </label>
          )}
          <div className="owner-card-actions">
            <button className="button button-outline" onClick={() => setAction('')}>
              Quay lại
            </button>
            <button
              className="button button-primary"
              disabled={action === 'Đã từ chối' && !reason.trim()}
              onClick={async () => {
                if (await act('appointments/' + id, 'POST', { status: action, reason }))
                  setAction('')
              }}
            >
              Xác nhận thao tác
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
