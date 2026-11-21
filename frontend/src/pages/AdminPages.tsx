import { useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  ShieldCheck,
  ArrowUpRight,
  ArrowLeft,
  Search,
  Check,
  EyeOff,
  LockKeyhole,
  UnlockKeyhole,
  X,
} from 'lucide-react'
import { Logo, Modal, EmptyState } from '../components/UI'
import { formatPrice } from '../assets/preview'
import { usePreview, type ManagedRoom as Post, type ManagedUser as User } from '../hooks/usePreview'
import { Navigate } from 'react-router-dom'

type Log = { id: number; text: string; time: string }
type AdminContext = {
  posts: Post[]
  users: User[]
  logs: Log[]
  changePost: (id: string, status: string, reason: string) => Promise<boolean>
  changeUser: (id: string, status: User['status'], reason: string) => Promise<boolean>
}
const postStatuses = ['Chờ duyệt', 'Đang hiển thị', 'Bị từ chối', 'Đã ẩn']
function useAdmin() {
  return useOutletContext<AdminContext>()
}
function Badge({ status }: { status: string }) {
  return (
    <span className="admin-badge" data-status={status}>
      {status}
    </span>
  )
}
function Heading({ title, text }: { title: string; text: string }) {
  return (
    <div className="admin-heading">
      <div>
        <span className="admin-overline">TRUNG TÂM QUẢN TRỊ</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  )
}
export function AdminLayout() {
  const { account, data, act, signOut, toast } = usePreview()
  if (account?.role !== 'ADMIN') return <Navigate to="/dang-nhap" replace />
  const posts = data!.listings,
    users = data!.users ?? [],
    logs = data!.logs ?? []
  const changePost = (id: string, status: string, reason: string) =>
    act('admin/listings/' + id, 'POST', {
      status,
      reason,
      version: posts.find((p) => p.id === id)?.version,
    })
  const changeUser = (id: string, status: User['status'], reason: string) =>
    act('admin/users/' + id, 'POST', {
      status,
      reason,
      version: users.find((u) => u.id === id)?.version,
    })
  return (
    <div className="admin-shell">
      {toast && (
        <p role="alert" className="toast toast-visible">
          {toast}
        </p>
      )}
      <aside className="admin-sidebar">
        <Logo admin />
        <span className="admin-overline">VẬN HÀNH HỆ THỐNG</span>
        <nav>
          <NavLink end to="/admin">
            <LayoutDashboard size={18} />
            Tổng quan
          </NavLink>
          <NavLink to="/admin/tin-dang">
            <FileCheck2 size={18} />
            Kiểm duyệt tin<span>{posts.filter((p) => p.status === 'Chờ duyệt').length}</span>
          </NavLink>
          <NavLink to="/admin/tai-khoan">
            <Users size={18} />
            Tài khoản
          </NavLink>
          <Link to="/" target="_blank" rel="noopener" aria-label="Xem trang khách (mở tab mới)">
            <ArrowUpRight size={18} />
            Xem trang khách
          </Link>
        </nav>
        <div className="admin-side-bottom">
          <ShieldCheck size={24} />
          <strong>Quản trị viên TROHN</strong>
          <small>Không gian làm việc nội bộ</small>
          <Link to="/chu-tro">↗ Giao diện chủ trọ</Link>
          <button onClick={signOut}>Đăng xuất</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            TROHN <span>/ Quản trị hệ thống</span>
          </span>
          <div>
            <ShieldCheck size={16} />
            <strong>{account.name}</strong>
            <span className="admin-avatar">A</span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet context={{ posts, users, logs, changePost, changeUser } satisfies AdminContext} />
        </main>
      </div>
    </div>
  )
}
export function AdminDashboard() {
  const { posts, users, logs } = useAdmin()
  const waiting = posts.filter((p) => p.status === 'Chờ duyệt')
  return (
    <>
      <Heading
        title="Tổng quan vận hành"
        text="Ưu tiên xử lý tin chờ duyệt và theo dõi trạng thái tài khoản."
      />
      <div className="admin-metrics">
        {[
          ['Tin chờ duyệt', waiting.length, '/admin/tin-dang?status=Chờ+duyệt'],
          [
            'Tin đang hiển thị',
            posts.filter((p) => p.status === 'Đang hiển thị').length,
            '/admin/tin-dang?status=Đang+hiển+thị',
          ],
          ['Tổng tài khoản', users.length, '/admin/tai-khoan'],
          [
            'Tài khoản đã khóa',
            users.filter((u) => u.status === 'Đã khóa').length,
            '/admin/tai-khoan?status=Đã+khóa',
          ],
        ].map(([title, value, to], i) => (
          <Link to={String(to)} key={title}>
            <span>
              <i className={`admin-dot dot-${i}`} />
              {title}
              <ArrowUpRight size={15} />
            </span>
            <strong>{value}</strong>
            <small>Xem danh sách</small>
          </Link>
        ))}
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <span className="admin-overline">CẦN XỬ LÝ</span>
              <h2>
                Hàng chờ kiểm duyệt <b>{waiting.length}</b>
              </h2>
            </div>
            <Link to="/admin/tin-dang?status=Chờ+duyệt">Xem tất cả →</Link>
          </div>
          {waiting.length ? (
            waiting.map((p) => (
              <Link className="admin-queue-item" key={p.id} to={`/admin/tin-dang/${p.id}`}>
                <img src={p.image} alt="" />
                <div>
                  <strong>{p.title}</strong>
                  <p>
                    {users.find((u) => u.id === p.ownerId)?.name} · {p.district}
                  </p>
                  <small>
                    {formatPrice(p.price)} triệu/tháng · {p.area} m²
                  </small>
                </div>
                <span className="admin-review-label">Xem xét →</span>
              </Link>
            ))
          ) : (
            <p className="admin-empty-inline">Đã xử lý hết tin chờ duyệt .</p>
          )}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-title">
            <h2>Nhật ký hoạt động</h2>
          </div>
          {logs.length ? (
            <ul className="admin-log">
              {logs.slice(0, 6).map((l) => (
                <li key={l.id}>
                  <span>{l.time}</span>
                  <p>{l.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-log-empty">
              <ShieldCheck size={30} />
              <h3>Chưa có thao tác mới</h3>
              <p>Các lần duyệt tin, ẩn tin và thay đổi trạng thái tài khoản sẽ hiện tại đây.</p>
            </div>
          )}
        </section>
      </div>
      <div className="admin-guidance">
        <FileCheck2 size={23} />
        <div>
          <strong>Kiểm tra thông tin trước khi duyệt</strong>
          <p>
            Đối chiếu tiêu đề, ảnh, địa chỉ, giá thuê và mô tả chi phí. Ghi rõ lý do khi từ chối để
            chủ trọ biết cần bổ sung gì.
          </p>
        </div>
      </div>
    </>
  )
}
export function AdminPosts() {
  const { posts, users } = useAdmin()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'Tất cả'
  const [query, setQuery] = useState('')
  const filtered = posts.filter(
    (p) =>
      (status === 'Tất cả' || p.status === status) &&
      `${p.title} ${p.district} ${users.find((u) => u.id === p.ownerId)?.name}`
        .toLocaleLowerCase('vi')
        .includes(query.toLocaleLowerCase('vi')),
  )
  return (
    <>
      <Heading
        title="Kiểm duyệt tin đăng"
        text="Xem xét nội dung trước khi công khai và xử lý những tin cần ẩn."
      />
      <div className="admin-tabs">
        {['Tất cả', ...postStatuses].map((s) => (
          <button
            key={s}
            aria-pressed={s === status}
            onClick={() => setParams(s === 'Tất cả' ? {} : { status: s })}
          >
            {s}
            <span>
              {s === 'Tất cả' ? posts.length : posts.filter((p) => p.status === s).length}
            </span>
          </button>
        ))}
      </div>
      <div className="admin-toolbar">
        <label>
          <Search size={17} />
          <input
            aria-label="Tìm tin đăng"
            placeholder="Tìm tiêu đề, khu vực hoặc chủ trọ…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span>{filtered.length} tin đăng</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tin đăng</th>
              <th>Chủ trọ</th>
              <th>Giá thuê</th>
              <th>Trạng thái</th>
              <th>
                <span className="admin-sr">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link className="admin-post-cell" to={`/admin/tin-dang/${p.id}`}>
                    <img src={p.image} alt="" />
                    <span>
                      <strong>{p.title}</strong>
                      <small>
                        {p.district} · {p.area} m² · {p.type}
                      </small>
                    </span>
                  </Link>
                </td>
                <td>
                  <Link to={`/admin/tai-khoan/${p.ownerId}`}>
                    {users.find((u) => u.id === p.ownerId)?.name}
                  </Link>
                </td>
                <td className="admin-nowrap">
                  {formatPrice(p.price)} triệu<small>/ tháng</small>
                </td>
                <td>
                  <Badge status={p.status} />
                </td>
                <td>
                  <Link className="admin-table-action" to={`/admin/tin-dang/${p.id}`}>
                    {p.status === 'Chờ duyệt' ? 'Xem xét' : 'Chi tiết'} →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <EmptyState
            title="Không có tin phù hợp"
            text="Thử từ khóa khác hoặc chọn lại trạng thái."
          />
        )}
      </div>
    </>
  )
}
function ActionDialog({
  title,
  text,
  needsReason,
  onClose,
  onConfirm,
}: {
  title: string
  text: string
  needsReason: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <Modal title={title} onClose={onClose}>
      <form
        className="admin-action-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (needsReason && !reason.trim()) return
          onConfirm(reason.trim())
        }}
      >
        <p>{text}</p>
        {needsReason && (
          <label>
            Lý do xử lý
            <textarea
              required
              maxLength={500}
              rows={4}
              placeholder="Ghi rõ lý do để người dùng biết thông tin cần điều chỉnh…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <small>{reason.length}/500 ký tự</small>
          </label>
        )}

        <div>
          <button className="button button-outline" type="button" onClick={onClose}>
            Quay lại
          </button>
          <button
            className="button button-primary"
            disabled={needsReason && !reason.trim()}
            type="submit"
          >
            Xác nhận thao tác
          </button>
        </div>
      </form>
    </Modal>
  )
}
export function AdminPostDetail() {
  const { id } = useParams()
  const { posts, users, changePost } = useAdmin()
  const post = posts.find((p) => p.id === id)
  const [action, setAction] = useState('')
  if (!post)
    return (
      <EmptyState
        title="Không tìm thấy tin đăng"
        text="Tin này không có trong hệ thống."
        action="Về danh sách tin"
        to="/admin/tin-dang"
      />
    )
  const owner = users.find((u) => u.id === post.ownerId)
  return (
    <>
      <Link className="admin-back" to="/admin/tin-dang">
        <ArrowLeft size={15} />
        Danh sách tin đăng
      </Link>
      <Heading
        title="Chi tiết kiểm duyệt"
        text="Xem đầy đủ nội dung và thông tin người đăng trước khi quyết định."
      />
      <div className="admin-detail-grid">
        <article className="admin-panel admin-post-detail">
          <img className="admin-detail-photo" src={post.image} alt={post.title} />
          <div className="admin-detail-body">
            <Badge status={post.status} />
            <h2>{post.title}</h2>
            <p>{post.address}</p>
            <div className="admin-facts">
              <div>
                <small>Giá thuê</small>
                <strong>{formatPrice(post.price)} triệu / tháng</strong>
              </div>
              <div>
                <small>Diện tích</small>
                <strong>{post.area} m²</strong>
              </div>
              <div>
                <small>Loại phòng</small>
                <strong>{post.type}</strong>
              </div>
            </div>
            <h3>Nội dung tin đăng</h3>
            <p>{post.description}</p>
            <h3>Tiện ích được khai báo</h3>
            <div className="admin-amenities">
              {post.amenities.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
            <h3>Chi phí khác</h3>
            <p>
              {post.costs
                ?.map((c) => c.label + ' ' + c.amount.toLocaleString('vi-VN') + ' đ')
                .join(' · ') || 'Chưa khai báo chi phí khác.'}
            </p>
            {post.reason && (
              <div className="admin-reason">
                <strong>Lý do xử lý gần nhất</strong>
                <p>{post.reason}</p>
              </div>
            )}
          </div>
        </article>
        <aside className="admin-review-aside">
          <section className="admin-panel admin-review-box">
            <span className="admin-overline">NGƯỜI ĐĂNG</span>
            <h3>{owner?.name}</h3>
            <p>{owner?.email}</p>
            <Badge status={owner?.status || 'Không xác định'} />
            <Link className="admin-back" to={`/admin/tai-khoan/${post.ownerId}`}>
              Xem tài khoản <ArrowUpRight size={14} />
            </Link>
          </section>
          <section className="admin-panel admin-review-box">
            <h3>Thao tác kiểm duyệt</h3>
            <p>Chỉ duyệt khi nội dung đủ rõ để khách thuê có thể đánh giá.</p>
            {post.status === 'Chờ duyệt' ? (
              <>
                <button
                  className="button button-primary"
                  disabled={owner?.status === 'Đã khóa'}
                  onClick={() => setAction('Đang hiển thị')}
                >
                  <Check size={17} />
                  Duyệt tin đăng
                </button>
                <button className="button button-outline" onClick={() => setAction('Bị từ chối')}>
                  <X size={17} />
                  Từ chối tin đăng
                </button>
                {owner?.status === 'Đã khóa' && (
                  <p className="admin-reason">Tài khoản chủ trọ đang bị khóa.</p>
                )}
              </>
            ) : post.status === 'Đang hiển thị' ? (
              <button className="button button-outline" onClick={() => setAction('Đã ẩn')}>
                <EyeOff size={17} />
                Ẩn tin đăng
              </button>
            ) : (
              <p>Không có thao tác duyệt ở trạng thái hiện tại.</p>
            )}
          </section>
        </aside>
      </div>
      {action && (
        <ActionDialog
          title={
            action === 'Đang hiển thị'
              ? 'Duyệt tin đăng?'
              : action === 'Bị từ chối'
                ? 'Từ chối tin đăng'
                : 'Ẩn tin đăng'
          }
          text={post.title}
          needsReason={action !== 'Đang hiển thị'}
          onClose={() => setAction('')}
          onConfirm={async (reason) => {
            if (await changePost(post.id, action, reason)) setAction('')
          }}
        />
      )}
    </>
  )
}
export function AdminUsers() {
  const { users } = useAdmin()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || ''
  const [role, setRole] = useState('')
  const [query, setQuery] = useState('')
  const filtered = users.filter(
    (u) =>
      (!status || u.status === status) &&
      (!role || u.role === role) &&
      `${u.name} ${u.email} ${u.id}`
        .toLocaleLowerCase('vi')
        .includes(query.toLocaleLowerCase('vi')),
  )
  return (
    <>
      <Heading
        title="Quản lý tài khoản"
        text="Tra cứu người dùng và kiểm soát trạng thái truy cập hệ thống."
      />
      <div className="admin-toolbar admin-user-toolbar">
        <label>
          <Search size={17} />
          <input
            aria-label="Tìm tài khoản"
            placeholder="Tìm tên, email hoặc mã tài khoản…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Vai trò tài khoản"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          <option>Chủ trọ</option>
          <option>Khách thuê</option>
        </select>
        <select
          aria-label="Trạng thái tài khoản"
          value={status}
          onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})}
        >
          <option value="">Tất cả trạng thái</option>
          <option>Hoạt động</option>
          <option>Đã khóa</option>
        </select>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tài khoản ({filtered.length})</th>
              <th>Mã</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>
                <span className="admin-sr">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link className="admin-user-cell" to={`/admin/tai-khoan/${u.id}`}>
                    <span className="admin-avatar">{u.name.split(' ').at(-1)?.charAt(0)}</span>
                    <span>
                      <strong>{u.name}</strong>
                      <small>{u.email}</small>
                    </span>
                  </Link>
                </td>
                <td>{u.id}</td>
                <td>{u.role}</td>
                <td>
                  <Badge status={u.status} />
                </td>
                <td>
                  <Link className="admin-table-action" to={`/admin/tai-khoan/${u.id}`}>
                    Chi tiết →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <EmptyState title="Không tìm thấy tài khoản" text="Thử đổi từ khóa hoặc bộ lọc." />
        )}
      </div>
    </>
  )
}
export function AdminUserDetail() {
  const { id } = useParams()
  const { users, posts, changeUser } = useAdmin()
  const user = users.find((u) => u.id === id)
  const [action, setAction] = useState(false)
  if (!user)
    return (
      <EmptyState
        title="Không tìm thấy tài khoản"
        text="Tài khoản không có trong hệ thống."
        action="Về danh sách"
        to="/admin/tai-khoan"
      />
    )
  const owned = posts.filter((p) => p.ownerId === user.id)
  return (
    <>
      <Link className="admin-back" to="/admin/tai-khoan">
        <ArrowLeft size={15} />
        Danh sách tài khoản
      </Link>
      <Heading title="Thông tin tài khoản" text={`Mã người dùng ${user.id}`} />
      <div className="admin-detail-grid">
        <section className="admin-panel admin-detail-body">
          <div className="admin-profile">
            <span className="admin-avatar">{user.name.split(' ').at(-1)?.charAt(0)}</span>
            <div>
              <h2>{user.name}</h2>
              <p>{user.role}</p>
            </div>
            <Badge status={user.status} />
          </div>
          <dl className="admin-user-facts">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>

            <div>
              <dt>Vai trò</dt>
              <dd>{user.role}</dd>
            </div>
          </dl>
          {user.reason && (
            <div className="admin-reason">
              <strong>Lý do khóa</strong>
              <p>{user.reason}</p>
            </div>
          )}
          {user.role === 'Chủ trọ' && (
            <>
              <h3>Tin đăng của tài khoản ({owned.length})</h3>
              {owned.map((p) => (
                <Link className="admin-owned-post" key={p.id} to={`/admin/tin-dang/${p.id}`}>
                  <span>{p.title}</span>
                  <Badge status={p.status} />
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </>
          )}
        </section>
        <aside className="admin-panel admin-review-box">
          <h3>Trạng thái truy cập</h3>
          <p>Quản lý quyền truy cập của tài khoản.</p>
          <button
            className={`button ${user.status === 'Đã khóa' ? 'button-primary' : 'button-outline'}`}
            disabled={user.role === 'Admin'}
            onClick={() => setAction(true)}
          >
            {user.status === 'Đã khóa' ? <UnlockKeyhole size={17} /> : <LockKeyhole size={17} />}{' '}
            {user.status === 'Đã khóa' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
          </button>
        </aside>
      </div>
      {action && (
        <ActionDialog
          title={user.status === 'Đã khóa' ? 'Mở khóa tài khoản?' : 'Khóa tài khoản'}
          text={`${user.name} · ${user.email}`}
          needsReason={user.status !== 'Đã khóa'}
          onClose={() => setAction(false)}
          onConfirm={async (reason) => {
            if (
              await changeUser(user.id, user.status === 'Đã khóa' ? 'Hoạt động' : 'Đã khóa', reason)
            )
              setAction(false)
          }}
        />
      )}
    </>
  )
}

// Admin preview routes.
