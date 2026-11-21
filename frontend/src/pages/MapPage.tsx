import { usePreview } from '../hooks/usePreview'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Maximize, ArrowUpRight } from 'lucide-react'
import { formatPrice } from '../assets/preview'

export function MapPage() {
  const { districts, rooms } = usePreview()
  const positions: Record<string, [number, number]> = Object.fromEntries(
    rooms.filter((r) => r.lat != null && r.lng != null).map((r) => [r.id, [r.lat!, r.lng!]]),
  )
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markers = useRef(new Map<string, L.Marker>())
  const [district, setDistrict] = useState('')
  const [budget, setBudget] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [tileError, setTileError] = useState(false)
  const filtered = useMemo(
    () =>
      rooms.filter(
        (room) =>
          room.lat != null &&
          room.lng != null &&
          (!district || room.district === district) &&
          (!budget || room.price <= Number(budget)),
      ),
    [rooms, district, budget],
  )
  const activeRoom = filtered.find((room) => room.id === selected)

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView(
      [21.018, 105.813],
      12,
    )
    map.current = instance
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution:
        'Dữ liệu &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> (ODbL) · Bản đồ <a href="https://www.openstreetmap.fr">OSM France</a> (CC BY-SA)',
    })
      .on('loading', () => setTileError(false))
      .on('tileerror', () => setTileError(true))
      .addTo(instance)
    const observer = new ResizeObserver(() => instance.invalidateSize())
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      tiles.off()
      instance.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current) return
    const instance = map.current
    const group = L.layerGroup().addTo(instance)
    markers.current.clear()
    filtered.forEach((room) => {
      const marker = L.marker(positions[room.id], {
        icon: L.divIcon({
          className: 'room-map-pin',
          html: `<span>${formatPrice(room.price)} tr</span>`,
          iconSize: [70, 32],
          iconAnchor: [35, 16],
        }),
        title: `${room.title} — ${formatPrice(room.price)} triệu`,
        alt: room.title,
      })
        .on('click', () => setSelected(room.id))
        .addTo(group)
      markers.current.set(room.id, marker)
    })
    if (filtered.length)
      instance.fitBounds(L.latLngBounds(filtered.map((room) => positions[room.id])), {
        padding: [65, 65],
        maxZoom: 14,
      })
    return () => {
      group.remove()
      markers.current.clear()
    }
  }, [filtered])

  useEffect(() => {
    markers.current.forEach((marker, id) => {
      marker.getElement()?.classList.toggle('pin-selected', id === selected)
      marker.setZIndexOffset(id === selected ? 1000 : 0)
    })
  }, [selected, filtered])

  function selectRoom(id: string) {
    setSelected(id)
    map.current?.setView(positions[id], 15)
  }

  return (
    <section className="map-page container">
      <div className="map-page-heading">
        <div>
          <span className="eyebrow">NHÌN HÀ NỘI THEO CÁCH CỦA BẠN</span>
          <h1>Tìm chốn về trên bản đồ.</h1>
          <p>Kéo bản đồ, phóng to và chạm vào giá phòng để khám phá.</p>
        </div>
        <Link className="text-link" to="/tim-phong">
          Xem dạng danh sách <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="map-toolbar">
        <label>
          Khu vực
          <select
            value={district}
            onChange={(event) => {
              setDistrict(event.target.value)
              setSelected(null)
            }}
          >
            <option value="">Tất cả Hà Nội</option>
            {districts.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Ngân sách
          <select
            value={budget}
            onChange={(event) => {
              setBudget(event.target.value)
              setSelected(null)
            }}
          >
            <option value="">Tất cả mức giá</option>
            <option value="3">Đến 3 triệu</option>
            <option value="4">Đến 4 triệu</option>
            <option value="5">Đến 5 triệu</option>
          </select>
        </label>
        <span>{filtered.length} phòng có tọa độ</span>
        <button
          className="button button-outline"
          onClick={() => {
            if (filtered.length)
              map.current?.fitBounds(L.latLngBounds(filtered.map((room) => positions[room.id])), {
                padding: [65, 65],
                maxZoom: 14,
              })
          }}
        >
          <Maximize size={16} /> Xem toàn bộ ghim
        </button>
      </div>
      <div className="map-workspace">
        <aside className="map-list" aria-label="Phòng trên bản đồ">
          {filtered.length ? (
            filtered.map((room) => (
              <button
                key={room.id}
                className={`map-list-card ${selected === room.id ? 'is-selected' : ''}`}
                onClick={() => selectRoom(room.id)}
                aria-pressed={selected === room.id}
              >
                <img src={room.image} alt="" />
                <span>
                  <small>
                    {room.district} · {room.area} m²
                  </small>
                  <strong>{room.title}</strong>
                  <b>
                    {formatPrice(room.price)} triệu <small>/ tháng</small>
                  </b>
                </span>
              </button>
            ))
          ) : (
            <p className="map-empty">Chưa có phòng phù hợp. Thử đổi khu vực hoặc ngân sách nhé.</p>
          )}
        </aside>
        <div className="map-canvas-wrap">
          <div className="rental-map" ref={container} aria-label="Bản đồ phòng trọ Hà Nội" />
          {tileError && (
            <div className="map-network-note" role="status">
              Một phần bản đồ chưa tải được. Kiểm tra kết nối và tải lại trang.
            </div>
          )}
          {activeRoom && (
            <div className="map-room-preview">
              <button
                className="map-preview-close"
                aria-label="Đóng thông tin phòng"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
              <img src={activeRoom.image} alt={activeRoom.title} />
              <div>
                <small>
                  <MapPin size={12} /> {activeRoom.district}
                </small>
                <h2>{activeRoom.title}</h2>
                <p>
                  {formatPrice(activeRoom.price)} triệu / tháng · {activeRoom.area} m²
                </p>
                <Link className="text-link" to={`/phong/${activeRoom.id}`}>
                  Xem chi tiết phòng <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="map-disclaimer">Vị trí phòng do chủ trọ cung cấp.</p>
    </section>
  )
}
