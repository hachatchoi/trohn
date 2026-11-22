import { lazy, Suspense, useRef, useState } from 'react'
import type { Room } from '../types'

const PinMap = lazy(() => import('./ListingPinMap'))
type AddressPoint = [string, number, number]
let addressBook: Promise<AddressPoint[]> | undefined

function addressKey(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/^\s*so\s+/, '')
    .replace(/\b(duong|pho)\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function ListingLocation({ existing, rooms }: { existing?: Room; rooms: Room[] }) {
  const [address, setAddress] = useState(existing?.address ?? '')
  const [lat, setLat] = useState(String(existing?.lat ?? ''))
  const [lng, setLng] = useState(String(existing?.lng ?? ''))
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [choices, setChoices] = useState<AddressPoint[]>([])
  const generation = useRef(0)
  function pin(latitude: number, longitude: number) {
    generation.current++
    setLat(String(latitude))
    setLng(String(longitude))
    setChoices([])
    setMessage('Đã chọn vị trí. Bấm trên bản đồ nếu cần chỉnh ghim.')
  }
  async function lookup() {
    const request = ++generation.current
    setOpen(true)
    setChoices([])
    setMessage('Đang tìm địa chỉ…')
    try {
      addressBook ??= fetch('/hanoi-addresses.json')
        .then((response) => {
          if (!response.ok) throw new Error('address book')
          return response.json() as Promise<AddressPoint[]>
        })
        .catch((error) => {
          addressBook = undefined
          throw error
        })
      const book = await addressBook
      if (request !== generation.current) return
      const key = addressKey(address)
      const parts = key.split(',').map((part) => part.trim())
      const known: AddressPoint[] = rooms.flatMap((room) =>
        room.lat != null && room.lng != null
          ? [[room.address, room.lat, room.lng] as AddressPoint]
          : [],
      )
      const matches = [...known, ...book].filter(([label]) => {
        const candidate = addressKey(label)
        const street = candidate.split(',')[0].trim()
        return (
          candidate === key ||
          key.startsWith(candidate + ',') ||
          (street === parts[0] && /\d.*\s+[a-z]/.test(street)) ||
          candidate.startsWith(key + ',')
        )
      })
      const unique = matches.filter(
        (point, i) =>
          matches.findIndex((other) => other[1] === point[1] && other[2] === point[2]) === i,
      )
      if (unique.length === 1) pin(unique[0][1], unique[0][2])
      else {
        setChoices(unique)
        setMessage(
          unique.length
            ? 'Chọn địa điểm và kiểm tra ghim trên bản đồ.'
            : 'Chưa tìm thấy số nhà này. Phóng to và bấm đúng vị trí phòng trên bản đồ.',
        )
      }
    } catch {
      if (request === generation.current)
        setMessage('Chưa tải được danh mục địa chỉ. Bạn có thể chọn vị trí trên bản đồ.')
    }
  }
  return (
    <div className="listing-location">
      <label>
        Địa chỉ cụ thể
        <input
          name="address"
          required
          value={address}
          placeholder="Ví dụ: 157 Đình Thôn, Nam Từ Liêm"
          onChange={(e) => {
            generation.current++
            setAddress(e.target.value)
            setLat('')
            setLng('')
            setChoices([])
            setMessage('Tìm lại vị trí sau khi đổi địa chỉ.')
          }}
        />
      </label>
      <button
        className="button button-outline"
        type="button"
        disabled={!address.trim()}
        onClick={lookup}
      >
        Tìm vị trí theo địa chỉ
      </button>
      <button className="button button-outline" type="button" onClick={() => setOpen(!open)}>
        {open ? 'Thu gọn bản đồ' : 'Chọn trên bản đồ'}
      </button>
      <p role="status">
        {message ||
          (lat && lng
            ? 'Phòng đã có ghim bản đồ.'
            : 'Chọn vị trí để tin đã duyệt xuất hiện trên bản đồ và trong bộ lọc gần trường.')}
      </p>
      {choices.map(([label, y, x]) => (
        <button
          type="button"
          className="button button-outline"
          key={y + ',' + x}
          onClick={() => pin(y, x)}
        >
          {label} ({y.toFixed(5)}, {x.toFixed(5)})
        </button>
      ))}
      {open && (
        <Suspense fallback={<p>Đang tải bản đồ…</p>}>
          <PinMap lat={lat} lng={lng} onPick={pin} />
        </Suspense>
      )}
      <details>
        <summary>Nhập tọa độ thủ công</summary>
        <div className="owner-form-grid">
          <label>
            Vĩ độ
            <input
              type="number"
              name="lat"
              step="any"
              min="-90"
              max="90"
              required={!!lng}
              value={lat}
              onChange={(e) => {
                generation.current++
                setLat(e.target.value)
                setMessage('')
              }}
            />
          </label>
          <label>
            Kinh độ
            <input
              type="number"
              name="lng"
              step="any"
              min="-180"
              max="180"
              required={!!lat}
              value={lng}
              onChange={(e) => {
                generation.current++
                setLng(e.target.value)
                setMessage('')
              }}
            />
          </label>
        </div>
      </details>
      <small>
        Dữ liệu địa chỉ ©{' '}
        <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> (ODbL).
      </small>
    </div>
  )
}
