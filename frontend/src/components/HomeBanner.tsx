import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Pause, Play, ArrowUpRight } from 'lucide-react'
const slides = [
  {
    image: '/images/room-sunlight.jpg',
    alt: 'Không gian ở sáng thoáng với cửa sổ lớn',
    title: 'Tìm phòng trọ phù hợp, gần trường bạn học.',
    link: '/tim-phong',
    action: 'Khám phá phòng trọ',
  },
  {
    image: '/images/room-cozy.jpg',
    alt: 'Phòng ngủ ấm áp với giường và cửa sổ',
    title: 'Phòng trọ đến 3 triệu/tháng',
    link: '/tim-phong?max=3',
    action: 'Xem phòng đến 3 triệu',
  },
  {
    image: '/images/room-studio.jpg',
    alt: 'Căn hộ studio có không gian sinh hoạt riêng',
    title: 'Phòng studio tại Hà Nội',
    link: '/tim-phong?type=Studio',
    action: 'Xem phòng studio',
  },
  {
    image: '/images/room-kitchen.jpg',
    alt: 'Góc bếp sáng thoáng trong căn hộ',
    title: 'Chung cư mini tại Hà Nội',
    link: '/tim-phong?type=Chung+cư+mini',
    action: 'Xem chung cư mini',
  },
]
export function HomeBanner() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (paused || hovered || focused || reduced) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % slides.length), 5500)
    return () => window.clearInterval(timer)
  }, [paused, hovered, focused, reduced, index])
  const slide = slides[index]
  const select = (value: number) => {
    setIndex((value + slides.length) % slides.length)
    setPaused(true)
  }
  return (
    <section className="home-banner-section">
      <div className="container">
        <div
          className="home-banner"
          role="region"
          aria-roledescription="trình chiếu"
          aria-label="Gợi ý tìm phòng cho sinh viên"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
          }}
        >
          <div className="home-banner-images" aria-hidden="true">
            {slides.map((item, i) => (
              <img
                key={item.image}
                src={item.image}
                alt=""
                className={i === index ? 'current' : ''}
                fetchPriority={i === 0 ? 'high' : 'auto'}
              />
            ))}
          </div>
          <div className="home-banner-shade" />
          <div
            className="home-banner-copy"
            role="group"
            aria-roledescription="ảnh"
            aria-label={`${index + 1} / ${slides.length}: ${slide.alt}`}
          >
            <h1>{slide.title}</h1>
            <Link className="button button-primary" to={slide.link}>
              {slide.action}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="home-banner-controls">
            <div className="home-banner-dots">
              {slides.map((item, i) => (
                <button
                  key={item.image}
                  aria-label={`Xem banner ${i + 1}`}
                  aria-pressed={i === index}
                  onClick={() => select(i)}
                >
                  <span />
                </button>
              ))}
            </div>
            <div className="home-banner-arrows">
              <span>{String(index + 1).padStart(2, '0')} / 04</span>
              <button aria-label="Banner trước" onClick={() => select(index - 1)}>
                <ChevronLeft size={20} />
              </button>
              <button aria-label="Banner tiếp theo" onClick={() => select(index + 1)}>
                <ChevronRight size={20} />
              </button>
              {!reduced && (
                <button
                  aria-label={paused ? 'Tiếp tục chuyển banner' : 'Tạm dừng chuyển banner'}
                  onClick={() => setPaused((value) => !value)}
                >
                  {paused ? <Play size={16} /> : <Pause size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
