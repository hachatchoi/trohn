import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function ListingPinMap({
  lat,
  lng,
  onPick,
}: {
  lat: string
  lng: string
  onPick: (lat: number, lng: number) => void
}) {
  const element = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const pick = useRef(onPick)
  useEffect(() => {
    pick.current = onPick
  }, [onPick])
  useEffect(() => {
    const instance = L.map(element.current!, { scrollWheelZoom: false }).setView(
      [21.018, 105.813],
      12,
    )
    map.current = instance
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(instance)
    instance.on('click', (e: L.LeafletMouseEvent) =>
      pick.current(+e.latlng.lat.toFixed(7), +e.latlng.lng.toFixed(7)),
    )
    return () => {
      instance.remove()
      map.current = null
    }
  }, [])
  useEffect(() => {
    if (!map.current || !lat || !lng) return
    const point: L.LatLngTuple = [Number(lat), Number(lng)]
    if (!point.every(Number.isFinite) || Math.abs(point[0]) > 90 || Math.abs(point[1]) > 180) return
    const marker = L.circleMarker(point, {
      radius: 8,
      color: '#fff',
      fillColor: '#176d65',
      fillOpacity: 1,
      weight: 3,
    }).addTo(map.current)
    map.current.setView(point, Math.max(17, map.current.getZoom()))
    return () => {
      marker.remove()
    }
  }, [lat, lng])
  return (
    <div ref={element} aria-label="Bản đồ chọn vị trí phòng" style={{ height: 300, zIndex: 0 }} />
  )
}
