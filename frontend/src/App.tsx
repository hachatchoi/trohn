import {
  AdminLayout,
  AdminDashboard,
  AdminPosts,
  AdminPostDetail,
  AdminUsers,
  AdminUserDetail,
} from './pages/AdminPages'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { TenantLayout } from './layouts/TenantLayout'
import { HomePage } from './pages/HomePage'
const MapPage = lazy(() =>
  import('./pages/MapPage').then((module) => ({ default: module.MapPage })),
)
import { SearchPage } from './pages/SearchPage'
import { RoomDetailPage } from './pages/RoomDetailPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { BookingPage, BookingSuccessPage } from './pages/BookingPage'
import { AppointmentsPage, AppointmentDetailPage } from './pages/AppointmentsPage'
import { AuthPage } from './pages/AuthPage'
import { EmptyState } from './components/UI'
import {
  LandlordLayout,
  OwnerDashboard,
  OwnerListings,
  OwnerListingDetail,
  OwnerListingForm,
  OwnerVisits,
  OwnerVisitDetail,
} from './pages/LandlordPages'

export function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    const names: Record<string, string> = {
      '/': 'Tìm trọ, tìm một khởi đầu',
      '/tim-phong': 'Tìm phòng',
      '/ban-do': 'Bản đồ phòng trọ Hà Nội',
      '/yeu-thich': 'Phòng yêu thích',
      '/lich-hen': 'Lịch hẹn của tôi',
      '/dang-nhap': 'Đăng nhập',
      '/dang-ky': 'Đăng ký',
      '/quen-mat-khau': 'Quên mật khẩu',
      '/chu-tro': 'Tổng quan chủ trọ',
      '/chu-tro/tin-dang': 'Tin đăng của tôi',
      '/chu-tro/lich-hen': 'Lịch xem phòng',
    }
    document.title = `${names[pathname] || (pathname.startsWith('/admin') ? 'Quản trị hệ thống' : pathname.startsWith('/chu-tro/tin-dang') ? 'Thông tin tin đăng' : pathname.startsWith('/phong/') ? 'Chi tiết phòng' : pathname.startsWith('/dat-lich/') ? 'Đặt lịch xem phòng' : 'Chi tiết lịch hẹn')} | TROHN`
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <Routes>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="tin-dang" element={<AdminPosts />} />
        <Route path="tin-dang/:id" element={<AdminPostDetail />} />
        <Route path="tai-khoan" element={<AdminUsers />} />
        <Route path="tai-khoan/:id" element={<AdminUserDetail />} />
        <Route
          path="*"
          element={
            <EmptyState
              title="Trang quản trị không tồn tại"
              text="Quay lại tổng quan để tiếp tục."
              action="Về tổng quan"
              to="/admin"
            />
          }
        />
      </Route>
      <Route path="chu-tro" element={<LandlordLayout />}>
        <Route index element={<OwnerDashboard />} />
        <Route path="tin-dang" element={<OwnerListings />} />
        <Route path="tin-dang/them" element={<OwnerListingForm key="new" />} />
        <Route path="tin-dang/:id" element={<OwnerListingDetail />} />
        <Route path="tin-dang/:id/sua" element={<OwnerListingForm key="edit" />} />
        <Route path="lich-hen" element={<OwnerVisits />} />
        <Route path="lich-hen/:id" element={<OwnerVisitDetail />} />
      </Route>
      <Route element={<TenantLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tim-phong" element={<SearchPage />} />
        <Route
          path="ban-do"
          element={
            <Suspense fallback={<p className="container section">Đang mở bản đồ…</p>}>
              <MapPage />
            </Suspense>
          }
        />
        <Route path="phong/:id" element={<RoomDetailPage />} />
        <Route path="yeu-thich" element={<FavoritesPage />} />
        <Route path="dat-lich/thanh-cong" element={<BookingSuccessPage />} />
        <Route path="dat-lich/:id" element={<BookingPage />} />
        <Route path="lich-hen" element={<AppointmentsPage />} />
        <Route path="lich-hen/:id" element={<AppointmentDetailPage />} />
        <Route
          path="*"
          element={
            <EmptyState
              title="Bạn đang đi hơi xa rồi"
              text="Trang này chưa có, nhưng một căn phòng phù hợp có thể đang chờ bạn."
              action="Về trang chủ"
              to="/"
            />
          }
        />
      </Route>
      <Route path="dang-nhap" element={<AuthPage key="login" mode="login" />} />
      <Route path="dang-ky" element={<AuthPage key="register" mode="register" />} />
      <Route path="quen-mat-khau" element={<AuthPage key="forgot" mode="forgot" />} />
    </Routes>
  )
}

// Application routes.
