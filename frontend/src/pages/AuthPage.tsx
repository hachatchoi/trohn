import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Heart, Mail } from 'lucide-react'
import { Logo } from '../components/UI'
import { usePreview } from '../hooks/usePreview'

export function AuthPage({ mode }: { mode: 'login' | 'register' | 'forgot' }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { mutate } = usePreview()
  const [role, setRole] = useState('KHACH_THUE')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const register = mode === 'register'
  const forgot = mode === 'forgot'
  return (
    <div className={mode === 'login' ? 'auth-page login-page' : 'auth-page'}>
      {mode === 'login' ? (
        <aside className="login-room">
          <Logo light />
          <h2>Một nơi để ở.<br /><em>Một góc để là mình.</em></h2>
        </aside>
      ) : <aside className="auth-story">
        <Logo light />
        <div className="auth-story-copy">
          <span className="eyebrow">CHỐN VỀ CỦA SINH VIÊN HÀ NỘI</span>
          <h2>
            Một nơi để ở.
            <br />
            Một góc để là mình.
          </h2>
          <p>
            Hành trình mới bắt đầu từ một căn phòng
            <br />
            mà bạn muốn trở về mỗi ngày.
          </p>
        </div>
        <div className="auth-photo">
          <img src="/images/room-sunlight.jpg" alt="Không gian phòng yên bình, đầy ánh sáng" />
          <span>
            <Heart size={19} />
            find a room. feel at home.
          </span>
        </div>
        <div className="auth-story-bottom">
          <span>HÀ NỘI, VIỆT NAM</span>
          <span>✳</span>
          <span>YOUR NEXT CHAPTER</span>
        </div>
      </aside>}
      <div className="auth-main">
        <Link className="text-link auth-back" to="/">
          <ArrowLeft size={16} />
          Về trang chủ
        </Link>
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <Logo />
          </div>
          {sent ? (
            <div className="forgot-success">
              <div className="success-icon">
                <Mail size={35} />
              </div>
              <h1>Khôi phục mật khẩu</h1>
              <p>Hãy liên hệ quản trị viên để được hỗ trợ khôi phục tài khoản.</p>
              <Link className="button button-primary full-width" to="/dang-nhap">
                Quay lại đăng nhập
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <>
              {mode !== 'login' && <span className="eyebrow">
                {register
                  ? 'BẮT ĐẦU HÀNH TRÌNH CỦA BẠN'
                  : forgot
                    ? 'ĐỪNG LO, CHÚNG MÌNH Ở ĐÂY'
                    : 'RẤT VUI ĐƯỢC GẶP LẠI BẠN'}
              </span>}
              <h1>
                {register ? 'Tìm trọ cùng TROHN.' : forgot ? 'Quên mật khẩu?' : 'Đăng nhập'}
              </h1>
              <p className="auth-description">
                {register
                  ? 'Tạo tài khoản để lưu phòng yêu thích và dễ dàng đặt lịch xem.'
                  : forgot
                    ? 'Liên hệ quản trị viên để được hỗ trợ.'
                    : 'Chào bạn trở lại với TROHN.'}
              </p>
              {!register && !forgot && params.has('registered') && (
                <div className="form-success">
                  <CheckCircle2 size={19} />
                  Tài khoản đã được tạo. Bạn có thể đăng nhập.
                </div>
              )}
              <form
                onSubmit={async (event) => {
                  event.preventDefault()
                  setError('')
                  if (forgot) {
                    setSent(true)
                    return
                  }
                  if (register && (!name.trim() || !/^0\d{9}$/.test(phone))) {
                    setError('Hãy nhập họ tên và số điện thoại 10 chữ số bắt đầu bằng 0.')
                    return
                  }
                  if (register && password.length < 8) {
                    setError('Mật khẩu cần có ít nhất 8 ký tự.')
                    return
                  }
                  if (register && password !== confirm) {
                    setError('Mật khẩu xác nhận chưa khớp. Bạn kiểm tra lại nhé.')
                    return
                  }
                  try {
                    if (register) {
                      await mutate('register', 'POST', { name, email, phone, password, role })
                      navigate('/dang-nhap?registered=1')
                      return
                    }
                    const account = await mutate<{ role: string }>('login', 'POST', {
                      email,
                      password,
                    })
                    navigate(
                      account.role === 'ADMIN'
                        ? '/admin'
                        : account.role === 'CHU_TRO'
                          ? '/chu-tro'
                          : '/',
                    )
                  } catch (e) {
                    setError((e as Error).message)
                  }
                }}
              >
                {register && (
                  <div className="form-grid">
                    <label className="field">
                      Loại tài khoản
                      <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="KHACH_THUE">Khách thuê</option>
                        <option value="CHU_TRO">Chủ trọ</option>
                      </select>
                    </label>
                    <label className="field">
                      Họ và tên
                      <input
                        required
                        autoComplete="name"
                        placeholder="Tên của bạn"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={80}
                      />
                    </label>
                    <label className="field">
                      Số điện thoại
                      <input
                        required
                        type="tel"
                        autoComplete="tel"
                        placeholder="09xx xxx xxx"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        maxLength={10}
                      />
                    </label>
                  </div>
                )}
                <label className="field">
                  {mode === 'login' ? 'Tên đăng nhập hoặc email' : 'Địa chỉ email'}
                  <input
                    type={mode === 'login' ? 'text' : 'email'}
                    required
                    autoComplete={mode === 'login' ? 'username' : 'email'}
                    placeholder={mode === 'login' ? 'Tên đăng nhập hoặc email' : 'ban@example.com'}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                {!forgot && (
                  <>
                    <label className="field">
                      Mật khẩu
                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete={register ? 'new-password' : 'current-password'}
                          placeholder={register ? 'Ít nhất 8 ký tự' : 'Nhập mật khẩu của bạn'}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          minLength={register ? 8 : undefined}
                        />
                        <button
                          className="icon-button"
                          type="button"
                          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                    {register && (
                      <label className="field">
                        Xác nhận mật khẩu
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          placeholder="Nhập lại mật khẩu"
                          value={confirm}
                          onChange={(event) => setConfirm(event.target.value)}
                          minLength={8}
                        />
                      </label>
                    )}
                    {!register && (
                      <div className="forgot-row">
                        <Link to="/quen-mat-khau">Quên mật khẩu?</Link>
                      </div>
                    )}
                  </>
                )}
                {error && (
                  <div className="form-error" role="alert">
                    {error}
                  </div>
                )}
                <button type="submit" className="button button-primary full-width">
                  {register ? 'Tạo tài khoản' : forgot ? 'Tiếp tục' : 'Đăng nhập'}
                  <ArrowRight size={18} />
                </button>
              </form>
              {!register && !forgot && (
                <>
                  <Link className="login-browse" to="/tim-phong">
                    Xem phòng với tư cách khách
                    <ArrowRight size={17} />
                  </Link>
                </>
              )}
              <p className="auth-switch">
                {register
                  ? 'Đã có tài khoản?'
                  : forgot
                    ? 'Bạn đã nhớ mật khẩu?'
                    : 'Bạn chưa có tài khoản?'}{' '}
                <Link to={register || forgot ? '/dang-nhap' : '/dang-ky'}>
                  {register || forgot ? 'Đăng nhập' : 'Đăng ký ngay'}
                </Link>
              </p>
            </>
          )}
        </div>
        <p className="auth-copyright">
          © {new Date().getFullYear()} TROHN · Chốn về của bạn ở Hà Nội.
        </p>
      </div>
    </div>
  )
}
