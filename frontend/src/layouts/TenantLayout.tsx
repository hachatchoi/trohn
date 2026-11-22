import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Logo } from '../components/UI'
import { usePreview } from '../hooks/usePreview'

export function TenantLayout() {
  const { user, signOut, toast, favorites } = usePreview()
  const [menu, setMenu] = useState(false)
  const [account, setAccount] = useState(false)
  const location = useLocation()
  useEffect(() => {
    setMenu(false)
    setAccount(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])
  return (
    <div className="tenant-shell">
      <a href="#main-content" className="skip-link">
        Chuyển đến nội dung
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
            <NavLink to="/tim-phong">Tìm phòng</NavLink>
            <NavLink to="/ban-do">Bản đồ</NavLink>
            <NavLink to="/yeu-thich">
              Yêu thích{' '}
              {favorites.length > 0 && <span className="nav-count">{favorites.length}</span>}
            </NavLink>
            <NavLink to="/lich-hen">Lịch hẹn</NavLink>
          </nav>
          <div className="header-actions">
            {user ? (
              <div className="account-wrap">
                <button
                  className="account-button"
                  onClick={() => setAccount(!account)}
                  aria-expanded={account}
                >
                  <span className="avatar">{user.charAt(0)}</span>
                  <span>{user}</span>
                  <ChevronDown size={15} />
                </button>
                {account && (
                  <div className="account-menu">
                    <Link to="/yeu-thich">
                      <Heart size={16} /> Phòng đã lưu
                    </Link>
                    <Link to="/lich-hen">
                      <CalendarDays size={16} /> Lịch hẹn của tôi
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setAccount(false)
                      }}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link className="login-link" to="/dang-nhap">
                  Đăng nhập
                </Link>
                <Link className="button button-primary button-small" to="/dang-ky">
                  Đăng ký <ArrowUpRight size={16} />
                </Link>
              </>
            )}
            <button
              className="icon-button mobile-menu-button"
              aria-label={menu ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="mobile-nav" aria-label="Điều hướng di động">
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
            <NavLink to="/tim-phong">Tìm phòng</NavLink>
            <NavLink to="/ban-do">Bản đồ</NavLink>
            <NavLink to="/yeu-thich">Phòng yêu thích</NavLink>
            <NavLink to="/lich-hen">Lịch hẹn của tôi</NavLink>
            {!user && <Link to="/dang-nhap">Đăng nhập</Link>}
          </nav>
        )}
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Logo light />
          </div>
          <div>
            <h4>Khám phá</h4>
            <Link to="/chu-tro">Dành cho chủ trọ</Link>
            <Link to="/tim-phong">Tìm phòng trọ</Link>
            <Link to="/tim-phong?type=Studio">Căn hộ studio</Link>
            <Link to="/tim-phong?max=3">Phòng dưới 3 triệu</Link>
          </div>
          <div>
            <h4>Góc của bạn</h4>
            <Link to="/yeu-thich">Phòng yêu thích</Link>
            <Link to="/lich-hen">Lịch xem phòng</Link>
            <Link to="/dang-ky">Tạo tài khoản</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} TROHN</span>
        </div>
      </footer>
      <div className={`toast ${toast ? 'toast-visible' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <Check size={18} />
            {toast}
          </>
        )}
      </div>
    </div>
  )
}
