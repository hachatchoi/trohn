export function futureDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export const statusLabels = {
  rejected: 'Đã từ chối',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
}
export const formatPrice = (value: number) =>
  value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
export const formatDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
