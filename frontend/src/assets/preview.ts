export function futureDate(days: number) {
  const date = new Date(Date.now() + (7 + days * 24) * 3600000)
  return date.toISOString().slice(0, 10)
}
export const statusLabels = {
  rejected: 'Đã từ chối',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
}
export const formatPrice = (value: number) =>
  value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
export const formatDate = (value: string) => value.split('-').reverse().join('/')
