import { usePreview } from '../hooks/usePreview'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, MapPin, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'

import { EmptyState, Modal, RoomCard } from '../components/UI'

export function SearchPage() {
  const { districts, rooms, universities, roomCampuses } = usePreview()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [sort, setSort] = useState('suggested')
  const [mobileFilters, setMobileFilters] = useState(false)
  const district = params.get('district') || ''
  const max = params.get('max') || ''
  const type = params.get('type') || ''
  const area = params.get('area') || ''
  const amenity = params.get('amenity') || ''
  const university = params.get('university') || ''
  const radius = params.get('radius') || '3'
  const selectedUniversity = universities.find((item) => item.id === university)
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }
  const normalized = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/đ/g, 'd')
  const filtered = useMemo(() => {
    const list = rooms.filter(
      (room) =>
        (!district || room.district === district) &&
        (!university ||
          roomCampuses.some(
            (item) =>
              item.roomId === room.id &&
              item.campusId === university &&
              item.distanceKm <= Number(radius),
          )) &&
        (!max || room.price <= Number(max)) &&
        (!type || room.type === type) &&
        (!area || room.area >= Number(area)) &&
        (!amenity || room.amenities.includes(amenity)) &&
        (!params.get('q') ||
          normalized(`${room.title} ${room.school} ${room.district} ${room.address}`).includes(
            normalized(params.get('q')!),
          )),
    )
    return [...list].sort((a, b) =>
      sort === 'price-asc'
        ? a.price - b.price
        : sort === 'price-desc'
          ? b.price - a.price
          : sort === 'area'
            ? b.area - a.area
            : 0,
    )
  }, [rooms, roomCampuses, district, max, type, area, amenity, params, sort, university, radius])
  const reset = () => {
    setParams({})
    setQuery('')
  }
  const filters = (suffix: string) => (
    <>
      <div className="filter-heading">
        <h3>
          <SlidersHorizontal size={17} /> Bộ lọc
        </h3>
        <button className="plain-button" onClick={reset}>
          Đặt lại
        </button>
      </div>
      <div className="filter-group">
        <label htmlFor={fieldId('university', suffix)}>Trường đại học / cơ sở</label>
        <select
          id={fieldId('university', suffix)}
          value={university}
          onChange={(event) => {
            const next = new URLSearchParams(params)
            if (event.target.value) {
              next.set('university', event.target.value)
              next.set('radius', radius)
            } else {
              next.delete('university')
              next.delete('radius')
            }
            setParams(next)
          }}
        >
          <option value="">Tất cả trường</option>
          {universities.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.campus}
            </option>
          ))}
        </select>
        {university && (
          <>
            <label className="radius-label" htmlFor={fieldId('radius', suffix)}>
              Khoảng cách đến trường
            </label>
            <select
              id={fieldId('radius', suffix)}
              value={radius}
              onChange={(event) => setFilter('radius', event.target.value)}
            >
              <option value="1">Trong 1 km</option>
              <option value="2">Trong 2 km</option>
              <option value="3">Trong 3 km</option>
              <option value="5">Trong 5 km</option>
            </select>
            <p className="distance-preview-note">
              Khoảng cách đường chim bay từ phòng đến cơ sở trường.
            </p>
          </>
        )}
      </div>
      <div className="filter-group">
        <label htmlFor={fieldId('district', suffix)}>Khu vực</label>
        <select
          id={fieldId('district', suffix)}
          value={district}
          onChange={(event) => setFilter('district', event.target.value)}
        >
          <option value="">Tất cả Hà Nội</option>
          {districts.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <h4>Ngân sách / tháng</h4>
        {[
          ['', 'Tất cả mức giá'],
          ['3', 'Đến 3 triệu'],
          ['4', 'Đến 4 triệu'],
          ['5', 'Đến 5 triệu'],
        ].map(([value, label]) => (
          <label className="radio-row" key={value}>
            <input
              type="radio"
              name={fieldId('budget', suffix)}
              checked={max === value}
              onChange={() => setFilter('max', value)}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="filter-group">
        <h4>Loại phòng</h4>
        {['', 'Phòng trọ', 'Studio', 'Chung cư mini'].map((item) => (
          <label className="radio-row" key={item}>
            <input
              type="radio"
              name={fieldId('type', suffix)}
              checked={type === item}
              onChange={() => setFilter('type', item)}
            />
            {item || 'Tất cả loại phòng'}
          </label>
        ))}
      </div>
      <div className="filter-group">
        <label htmlFor={fieldId('area', suffix)}>Diện tích tối thiểu</label>
        <select
          id={fieldId('area', suffix)}
          value={area}
          onChange={(event) => setFilter('area', event.target.value)}
        >
          <option value="">Không giới hạn</option>
          <option value="25">Từ 25 m²</option>
          <option value="30">Từ 30 m²</option>
          <option value="35">Từ 35 m²</option>
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor={fieldId('amenity', suffix)}>Tiện ích bạn cần</label>
        <select
          id={fieldId('amenity', suffix)}
          value={amenity}
          onChange={(event) => setFilter('amenity', event.target.value)}
        >
          <option value="">Tất cả tiện ích</option>
          {['Ban công', 'Bếp riêng', 'Nội thất', 'Máy giặt', 'Chỗ để xe'].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="filter-tip">
        <MapPin size={22} />
        <p>
          Gần giảng đường hơn,
          <br />
          thêm thời gian cho bản thân.
        </p>
      </div>
    </>
  )
  return (
    <>
      <section className="page-intro">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={13} />
            <span>Tìm phòng</span>
          </div>
          <span className="eyebrow">CHỐN VỀ TIẾP THEO CỦA BẠN</span>
          <h1>Tìm phòng trọ tại Hà Nội</h1>
          <p>Phòng trọ, studio và những không gian vừa vặn tại Hà Nội.</p>
          <form
            className="search-page-bar"
            onSubmit={(event) => {
              event.preventDefault()
              setFilter('q', query)
            }}
          >
            <Search size={21} />
            <input
              aria-label="Tìm theo khu vực hoặc trường học"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tên trường, khu vực hoặc tên phòng bạn muốn tìm..."
            />
            <button className="button button-primary" type="submit">
              Tìm kiếm <ArrowIcon />
            </button>
          </form>
        </div>
      </section>
      <div className="container search-layout">
        <aside className="filter-sidebar">{filters('desktop')}</aside>
        <div className="results-panel">
          <div className="results-heading">
            <div>
              <h2>
                {selectedUniversity
                  ? `Phòng gần ${selectedUniversity.name}`
                  : district
                    ? `Phòng tại ${district}`
                    : 'Phòng dành cho bạn'}
              </h2>
              <p>
                <strong>{filtered.length}</strong> không gian phù hợp
              </p>
            </div>
            <div className="results-actions">
              <button
                className="button button-outline filter-mobile"
                onClick={() => setMobileFilters(true)}
              >
                <SlidersHorizontal size={17} />
                Bộ lọc
              </button>
              <select
                aria-label="Sắp xếp kết quả"
                className="sort-select"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="suggested">Gợi ý cho bạn</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="area">Diện tích lớn nhất</option>
              </select>
            </div>
          </div>
          {params.size > 0 && (
            <div className="active-filters">
              {Array.from(params.entries()).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'university') {
                      const next = new URLSearchParams(params)
                      next.delete('university')
                      next.delete('radius')
                      setParams(next)
                    } else setFilter(key, '')
                    if (key === 'q') setQuery('')
                  }}
                >
                  {key === 'university'
                    ? selectedUniversity?.name || value
                    : key === 'radius'
                      ? `Trong ${value} km`
                      : key === 'max'
                        ? `Đến ${value} triệu`
                        : key === 'area'
                          ? `Từ ${value} m²`
                          : value}
                  <X size={13} />
                </button>
              ))}
              <button className="clear-filters" onClick={reset}>
                Xóa bộ lọc <RotateCcw size={13} />
              </button>
            </div>
          )}
          {filtered.length ? (
            <>
              <div className="room-grid search-room-grid">
                {filtered.map((room) => (
                  <div key={room.id}>
                    <RoomCard room={room} />
                    {selectedUniversity && (
                      <p className="school-distance">
                        <MapPin size={14} /> Cách {selectedUniversity.name} khoảng{' '}
                        {roomCampuses
                          .find((item) => item.roomId === room.id && item.campusId === university)
                          ?.distanceKm.toFixed(1)}{' '}
                        km <small>đường chim bay</small>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="results-end">Bạn đã xem hết các phòng phù hợp.</p>
            </>
          ) : (
            <>
              <EmptyState
                title="Chưa tìm thấy căn phòng phù hợp"
                text="Thử mở rộng khu vực hoặc thay đổi ngân sách một chút nhé."
              />
              <div className="center">
                <button className="button button-primary" onClick={reset}>
                  Xóa bộ lọc và xem tất cả
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {mobileFilters && (
        <Modal title="Lọc phòng trọ" onClose={() => setMobileFilters(false)}>
          <div className="mobile-filter-content">{filters('mobile')}</div>
          <button
            className="button button-primary full-width"
            onClick={() => setMobileFilters(false)}
          >
            Xem {filtered.length} kết quả
          </button>
        </Modal>
      )}
    </>
  )
}
function ArrowIcon() {
  return <ChevronRight size={18} />
}

function fieldId(name: string, suffix: string) {
  return name + '-' + suffix
}
