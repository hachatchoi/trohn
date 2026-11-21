import { usePreview } from '../hooks/usePreview'
import { HomeBanner } from '../components/HomeBanner'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

import { RoomCard, SectionTitle } from '../components/UI'

export function HomePage() {
  const { districts, rooms, universities } = usePreview()
  const navigate = useNavigate()
  const [district, setDistrict] = useState('')
  const [budget, setBudget] = useState('')
  const [type, setType] = useState('')
  const [university, setUniversity] = useState('')
  return (
    <>
      <HomeBanner />
      <section className="container search-lift" aria-label="Tìm phòng nhanh">
        <div className="search-spotlight">
          <div className="search-spotlight-heading">
            <div>
              <span className="eyebrow">BẮT ĐẦU TỪ ĐIỀU BẠN CẦN</span>
              <h2>Bạn muốn tìm phòng ở đâu?</h2>
              <p>Gần giảng đường, vừa ngân sách, đúng không gian bạn thích.</p>
            </div>
            <span className="search-emblem" aria-hidden="true">
              <GraduationCap size={38} />
            </span>
          </div>
          <form
            className="hero-search"
            onSubmit={(event) => {
              event.preventDefault()
              const params = new URLSearchParams()
              if (district) params.set('district', district)
              if (budget) params.set('max', budget)
              if (type) params.set('type', type)
              if (university) {
                params.set('university', university)
                params.set('radius', '3')
              }
              navigate(`/tim-phong?${params}`)
            }}
          >
            <label>
              <span>
                <GraduationCap size={16} /> Trường đại học của bạn
              </span>
              <select value={university} onChange={(event) => setUniversity(event.target.value)}>
                <option value="">Chọn trường / cơ sở</option>
                {universities.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name} · {item.campus}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>
                <MapPin size={16} /> Khu vực bạn muốn ở
              </span>
              <select value={district} onChange={(event) => setDistrict(event.target.value)}>
                <option value="">Tất cả khu vực Hà Nội</option>
                {districts.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>
                <SlidersHorizontal size={16} /> Ngân sách mỗi tháng
              </span>
              <select value={budget} onChange={(event) => setBudget(event.target.value)}>
                <option value="">Chọn khoảng giá</option>
                <option value="3">Dưới 3 triệu</option>
                <option value="4">Dưới 4 triệu</option>
                <option value="5">Dưới 5 triệu</option>
              </select>
            </label>
            <label>
              <span>
                <GraduationCap size={16} /> Kiểu không gian
              </span>
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="">Tất cả loại phòng</option>
                <option>Phòng trọ</option>
                <option>Studio</option>
                <option>Chung cư mini</option>
              </select>
            </label>
            <button className="button button-primary" type="submit">
              <Search size={19} />
              Tìm phòng ngay
            </button>
          </form>
          <div className="quick-search">
            <span>Gợi ý cho bạn:</span>
            {districts.slice(0, 2).map((d) => (
              <Link key={d} to={'/tim-phong?district=' + encodeURIComponent(d)}>
                {d}
              </Link>
            ))}
            <Link to="/tim-phong?max=3">Dưới 3 triệu</Link>
            <Link to="/tim-phong?type=Studio">Studio có bếp</Link>
          </div>
        </div>
      </section>
      <nav className="container home-browse-nav" aria-label="Khám phá nhóm phòng">
        <span>Khám phá nhanh</span>
        <a href="#phong-noi-bat">Gợi ý cho bạn</a>
        <a href="#truong-dai-hoc">Gần trường</a>
        <a href="#nhom-studio">Studio</a>
        <a href="#nhom-mini">Chung cư mini</a>
        <a href="#nhom-cau-giay">Cầu Giấy</a>
        <a href="#nhom-gia-tot">Đến 3 triệu</a>
      </nav>
      <section className="container section" id="phong-noi-bat">
        <SectionTitle eyebrow="MỘT CHÚT GỢI Ý" title="Phòng có thể bạn quan tâm" to="/tim-phong">
          So sánh giá thuê, diện tích và vị trí trước khi chọn phòng.
        </SectionTitle>
        <div className="room-grid">
          {!rooms.length && <p>Chưa có phòng nào được duyệt đăng.</p>}
          {rooms.slice(0, 3).map((room) => (
            <RoomCard room={room} key={room.id} />
          ))}
        </div>
      </section>
      <section className="container campus-section" id="truong-dai-hoc">
        <SectionTitle eyebrow="THÊM VÀI PHÚT NGỦ NƯỚNG" title="Tìm theo trường đại học">
          Chọn nơi bạn học, khám phá những căn phòng xung quanh.
        </SectionTitle>
        <div className="campus-grid">
          {universities.map((item) => (
            <Link
              className="campus-card"
              key={item.id}
              to={`/tim-phong?university=${item.id}&radius=3`}
            >
              <span className="campus-monogram">{item.short}</span>
              <div>
                <h3>{item.name}</h3>
                <p>{item.campus}</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      </section>
      <HomeCollection
        title="Phòng studio"
        eyebrow="Ở MỘT MÌNH CŨNG THẬT VUI"
        description="Không gian riêng, phù hợp ở một người hoặc hai người."
        to="/tim-phong?type=Studio"
        items={rooms.filter((room) => room.type === 'Studio')}
      />
      <section className="container editorial-banner">
        <div className="editorial-copy">
          <span className="eyebrow">CHỐN VỀ CHO HAI</span>
          <h2>
            Tìm phòng ở cùng bạn.
            <br />
            Rộng hơn, tiện nghi hơn.
          </h2>
          <p>Một căn hộ nhỏ, đủ riêng tư và đủ chỗ cho những buổi tối cùng nhau nấu ăn.</p>
          <Link className="button button-cream" to="/tim-phong?type=Chung+cư+mini">
            Khám phá căn hộ mini <ArrowUpRight size={18} />
          </Link>
        </div>
        <img src="/images/room-kitchen.jpg" alt="Góc bếp sáng trong căn hộ" loading="lazy" />
        <span className="banner-sticker">
          Ở cùng nhau,
          <br />
          vui hơn một chút.
        </span>
      </section>
      <HomeCollection
        title="Chung cư mini"
        eyebrow="THÊM KHÔNG GIAN, THÊM THOẢI MÁI"
        description="Những căn hộ nhỏ cho bạn và người bạn cùng nhà."
        to="/tim-phong?type=Chung+cư+mini"
        items={rooms.filter((room) => room.type === 'Chung cư mini')}
      />
      <div className="home-district-collection">
        <HomeCollection
          title="Phòng trọ tại Cầu Giấy"
          eyebrow="DẠO MỘT VÒNG KHU PHỐ"
          description="Các lựa chọn phòng trọ và căn hộ trong khu vực Cầu Giấy."
          to="/tim-phong?district=Cầu+Giấy"
          items={rooms.filter((room) => room.district === 'Cầu Giấy').slice(0, 3)}
        />
      </div>
      <section className="container budget-banner">
        <div>
          <span className="eyebrow">NHẸ TIỀN PHÒNG, RỘNG TRẢI NGHIỆM</span>
          <h2>Tìm phòng trong ngân sách của bạn.</h2>
          <p>Khám phá những căn phòng đến 3 triệu mỗi tháng.</p>
        </div>
        <Link className="button button-primary" to="/tim-phong?max=3">
          Xem phòng vừa túi tiền <ArrowRight size={18} />
        </Link>
      </section>
      <HomeCollection
        title="Phòng đến 3 triệu / tháng"
        eyebrow="ĐẾN 3 TRIỆU / THÁNG"
        description="Giá thuê cơ bản đến 3 triệu; xem chi phí chi tiết trong từng tin."
        to="/tim-phong?max=3"
        items={rooms.filter((room) => room.price <= 3)}
      />
      <section className="neighborhood-section section">
        <div className="container">
          <SectionTitle eyebrow="GẦN TRƯỜNG, GẦN MỌI ĐIỀU" title="Khám phá theo khu vực">
            Khám phá những khu vực quen thuộc của sinh viên Hà Nội.
          </SectionTitle>
          <div className="neighborhood-grid">
            {districts
              .map((name, i) => ({
                name,
                code: String(i + 1).padStart(2, '0'),
                icon: ['cg', 'tx', 'dd', 'hbt'][i % 4],
                text: rooms.filter((r) => r.district === name).length + ' phòng',
              }))
              .map((item) => (
                <Link
                  className={`neighborhood-card ${item.icon}`}
                  to={`/tim-phong?district=${encodeURIComponent(item.name)}`}
                  key={item.name}
                >
                  <div className="neighborhood-top">
                    <span>HÀ NỘI / {item.code}</span>
                    <ArrowUpRight size={20} />
                  </div>
                  <div className="neighborhood-art" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <span className="art-sun" />
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.text}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
      <section className="container browse-map-callout">
        <div>
          <MapPin size={28} />
          <div>
            <h2>Chưa quen khu vực? Xem trên bản đồ.</h2>
            <p>Xác định vị trí các phòng để chọn khu vực thuận tiện cho việc đi học.</p>
          </div>
        </div>
        <Link className="button button-primary" to="/ban-do">
          Mở bản đồ Hà Nội <ArrowUpRight size={17} />
        </Link>
      </section>{' '}
    </>
  )
}

function HomeCollection({
  title,
  eyebrow,
  description,
  to,
  items,
}: {
  title: string
  eyebrow: string
  description: string
  to: string
  items: import('../types').Room[]
}) {
  if (!items.length) return null
  return (
    <section
      className="container section home-collection"
      id={
        to.includes('Studio')
          ? 'nhom-studio'
          : to.includes('Chung')
            ? 'nhom-mini'
            : to.includes('district')
              ? 'nhom-cau-giay'
              : 'nhom-gia-tot'
      }
    >
      <SectionTitle eyebrow={eyebrow} title={title} to={to}>
        {description}
      </SectionTitle>
      <div className="room-grid">
        {items.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  )
}
