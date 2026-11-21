from architecture_data import *
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import shutil,xml.etree.ElementTree as E,json

OUT=ROOT/'Architecture';BK=ROOT/'Bao-cao-dong-bo/Kiem-tra-2026-10-14/Truoc-bo-sung-kien-truc'
for rel in ['Architecture/SYSTEM_ARCHITECTURE.docx','Architecture/SYSTEM_ARCHITECTURE.md','Architecture/SYSTEM_ARCHITECTURE.pdf','Architecture/SYSTEM_ARCHITECTURE.png','API/API_DESIGN.md','API/THIET_KE_API_TROHN.docx']:
 p=ROOT/rel;q=BK/rel;q.parent.mkdir(parents=True,exist_ok=True)
 if not q.exists():shutil.copy2(p,q)
d=Document(BK/'Architecture/SYSTEM_ARCHITECTURE.docx')
for name in ['Title','Heading 1','Heading 2','Normal','Caption']:
 st=d.styles[name];st.font.name='Arial';st.font.color.rgb=RGBColor(0,0,0)
d.styles['Normal'].font.size=Pt(11)
d.styles['Normal'].paragraph_format.space_after=Pt(6)
d.styles['Normal'].paragraph_format.line_spacing=1.05
for p in d.paragraphs:
 if p.style.name.startswith('Heading'):p.text=p.text.replace('. ',' ',1)
for shape in list(d.inline_shapes):
 rid=shape._inline.graphic.graphicData.pic.blipFill.blip.embed
 d.part.related_parts[rid]._blob=(OUT/'So-do/Kien_truc_tong_the.png').read_bytes()
 shape.width=Inches(6.6);shape.height=Inches(6.6*1300/1400)

def paragraph(text,style=None):return d.add_paragraph(text,style)
def heading(text,level=1):return d.add_heading(text,level)
def newpage(title):d.add_page_break();heading(title)
def table(headers,rows,widths):
 t=d.add_table(rows=1,cols=len(headers));t.autofit=False
 for col,w in zip(t.columns,widths):col.width=Inches(w)
 for c,txt in zip(t.rows[0].cells,headers):c.text=txt
 t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
 for row in rows:
  for c,txt in zip(t.add_row().cells,row):c.text=str(txt)
 for i,row in enumerate(t.rows):
  row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
  for c,w in zip(row.cells,widths):
   c.width=Inches(w);c.vertical_alignment=1;pr=c._tc.get_or_add_tcPr()
   sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'DAE8FC' if i==0 else 'FFFFFF');pr.append(sh)
   borders=OxmlElement('w:tcBorders');m=OxmlElement('w:tcMar')
   for side in ['top','bottom','left','right']:
    x=OxmlElement('w:'+side);x.set(qn('w:val'),'single');x.set(qn('w:sz'),'4');x.set(qn('w:color'),'D9D9D9');borders.append(x)
    x=OxmlElement('w:'+side);x.set(qn('w:w'),'85');x.set(qn('w:type'),'dxa');m.append(x)
   pr.append(borders);pr.append(m)
   for p in c.paragraphs:
    p.paragraph_format.space_after=Pt(3);p.paragraph_format.line_spacing=1.0
    for r in p.runs:r.font.name='Arial';r.font.size=Pt(10);r.bold=i==0
 paragraph('');return t

# Insert a dated scope note without replacing the user's existing technical content.
d.paragraphs[0].insert_paragraph_before('Cập nhật thiết kế ngày 14/10/2026',style='Subtitle')
# Move subtitle below title.
subtitle=d.paragraphs[0]._p;title=d.paragraphs[1]._p;title.addnext(subtitle)
intro='Tài liệu phục vụ báo cáo lần 2 ngày 15/10/2026. Bản bổ sung trình bày kiến trúc, triển khai, công nghệ, quyết định và cách kiểm chứng; kèm đối chiếu 21 UC với API, lớp và dữ liệu. Frontend hiện là demo; backend, các tiêu chí chất lượng và triển khai production vẫn là thiết kế cần thực hiện.'
np=d.add_paragraph(intro);subtitle.addnext(np._p)

# Deployment figures are added as a focused supplement to the existing section 6.
newpage('9 Sơ đồ triển khai theo môi trường')
paragraph('Hai sơ đồ dưới đây phân biệt nơi chạy và đường kết nối. Chưa chọn nhà cung cấp hosting hoặc tên miền; không coi phương án production là hạ tầng đã triển khai.')
d.add_picture(str(OUT/'So-do/Trien_khai_local.png'),width=Inches(6.6))
paragraph('Hình 2 Môi trường local đề xuất cho triển khai và kiểm thử',style='Caption')
d.add_page_break()
d.add_picture(str(OUT/'So-do/Trien_khai_production.png'),width=Inches(6.6))
paragraph('Hình 3 Phương án production cùng origin qua reverse proxy',style='Caption')
paragraph('Trong bản tối thiểu, release thực hiện theo quy trình build frontend, kiểm thử backend, sao lưu dữ liệu, áp dụng migration và triển khai. Chỉ bổ sung pipeline CI/CD sau khi có backend và kiểm thử tự động; hiện chưa khẳng định có pipeline hoạt động.')

newpage('10 Công nghệ và trạng thái thực hiện')
paragraph('Bảng phân biệt thư viện có trong frontend với công nghệ backend dự kiến. Phiên bản cụ thể của backend cần được chốt khi triển khai; không suy ra tính năng đã vận hành chỉ từ lựa chọn công nghệ.')
table(['Thành phần','Vai trò','Trạng thái'],TECH,[1.65,2.5,2.45])

newpage('11 Quyết định kiến trúc và đánh đổi')
paragraph('Các lựa chọn giữ nguyên phạm vi tìm và cho thuê phòng trọ. Mỗi quyết định gắn với yêu cầu nghiệp vụ và chi phí chấp nhận; không bổ sung công nghệ chỉ để làm sơ đồ phức tạp hơn.')
table(['Quyết định','Lý do','Đánh đổi'],DECISIONS,[1.55,2.5,2.55])

newpage('12 Yêu cầu phi chức năng và kế hoạch kiểm chứng')
paragraph('Tất cả tiêu chí dưới đây là yêu cầu hoặc mục tiêu đề xuất, chưa phải kết quả đã đạt. Các giới hạn upload kế thừa API hiện tại. NFR06 là kịch bản đo sơ bộ cần xác nhận trên máy thử nghiệm thực tế; nếu chưa đạt phải báo số đo và điều chỉnh thiết kế.')
table(['Mã và nhóm','Tiêu chí','Cách kiểm chứng'],NFR,[1.25,2.35,3.0])
paragraph('Biên bản thử nghiệm cần ghi ngày chạy, phiên bản mã/schema, cấu hình máy, bộ dữ liệu, thao tác, kết quả kỳ vọng, kết quả thực tế và bằng chứng. Chưa điền PASS hoặc số đo nếu chưa chạy. Sao lưu chỉ được coi là có thể dùng sau khi đã thử khôi phục.')

newpage('13 Đối chiếu use case API lớp và cơ sở dữ liệu')
paragraph('Bảng bao phủ 21 thao tác nghiệp vụ chính. Prefix chung là /api/v1. Trong mỗi nhóm, tên phương thức ở cột giữa thuộc cả Controller và Service được nêu ở tiêu đề nhóm; phương thức Service không tự đặt mã HTTP. Controller ánh xạ DTO, tham số đường dẫn/query và trạng thái HTTP.')
paragraph('R là các bảng đọc nghiệp vụ, W là các bảng có thể ghi; đây là tập truy cập theo nhánh, không có nghĩa mọi lần gọi đều ghi tất cả. Các API bảo vệ còn đọc PhienDangNhap và TaiKhoan để xác thực. Request ghi khóa tài khoản/phiên theo TRANSACTIONS.md. Ảnh có thao tác file ngoài DB; UC04 chỉ đọc CoSoTruong khi tìm gần trường.')
paragraph('13 endpoint đọc hỗ trợ vẫn được đặc tả trong tài liệu API. Bảng này không khẳng định Class Diagram đã khai báo riêng mọi phương thức của 34 endpoint; các phương thức hỗ trợ cần được chi tiết hóa khi dựng backend, không thêm use case ghi.')
api=api_rows()
groups=[('Tài khoản','TaiKhoan',[1,2,3,20,21]),('Tìm kiếm và tin đăng','TinDang',[4,5,12,13,14,17,18,19]),('Yêu thích','YeuThich',[6,7,8]),('Lịch hẹn','LichHen',[9,10,11,15,16])]
mapping_md=['# Đối chiếu thiết kế TROHN ngày 14/10/2026','', 'Prefix API: /api/v1. R = đọc, W = ghi theo nhánh. Xác thực dùng thêm TaiKhoan và PhienDangNhap. Phạm vi bảng: 21 thao tác nghiệp vụ chính; 13 endpoint hỗ trợ được đặc tả riêng trong API.','']
for gi,(label,module,nums) in enumerate(groups):
 if gi in (1,2):d.add_page_break()
 heading(f'13 {gi+1} {label}',2)
 paragraph(f'{module}Controller → {module}Service. Các tên thao tác tiếng Anh trong bảng API là nhãn mô tả; phương thức Java thiết kế dùng tên trong bảng dưới đây.')
 rows=[]
 mapping_md += [f'## {label}', '', '| UC và endpoint | Controller → Service | Dữ liệu |','|---|---|---|']
 for num in nums:
  uc,mod,method,reads,writes=MAPPING[num-1];a=api[uc]
  rows.append([a[0]+'\n'+a[1],method+'()\n'+a[4],'R: '+reads+'\nW: '+writes])
  mapping_md.append(f'| {a[0]} — {a[1]} | {mod}Controller.{method} → {mod}Service.{method} | R: {reads}; W: {writes} |')
 table(['UC và endpoint','Phương thức và HTTP trả về','Bảng dữ liệu'],rows,[2.1,1.85,2.65])

newpage('13 5 Quy ước chữ ký và các điểm đã đồng bộ')
sync=[
['UC04','timKiem trả Page<TinTomTat>, phù hợp danh sách công khai.'],
['UC06 / UC08','Thêm yêu thích trả LuuYeuThichResponse {tinId, saved}; danh sách nhận page, size và trả Page<YeuThichResponse>.'],
['UC10 / UC15 / UC16','Hủy, xác nhận, từ chối lịch trả LichHenResponse thay cho void.'],
['UC12 / UC13','Tạo tin nhận TinDangRequest và photos; sửa nhận SuaTinRequest có version, giuAnhIds và photos; cả hai trả TinQuanLyResponse.'],
['UC14 / UC19','Ẩn tin trả TrangThaiTinResponse {id, trangThai, version}; không trả nội dung riêng qua endpoint công khai.'],
['UC17 / UC18','Duyệt và từ chối tin trả TinQuanLyResponse.'],
['UC20 / UC21','Khóa và mở khóa tài khoản trả TaiKhoanResponse.']]
table(['Phạm vi','Điều chỉnh thiết kế'],sync,[1.35,5.25])
paragraph('ActorContext do backend tạo; không có trong body client. LyDoRequest, VersionRequest và VersionLyDoRequest được Controller tách thành tham số lyDo/version khi gọi Service. Multipart có part data và photos. Kết quả lớp mô tả data nghiệp vụ; envelope {data, message, requestId}, cookie, header và mã HTTP do tầng HTTP bổ sung. void ở đăng xuất và bỏ yêu thích tương ứng 204 không body.')
paragraph('UC09 trả 201 khi tạo mới, 200 khi trả lịch trùng hiện có. Triển khai cần truyền dấu hiệu tạo mới từ Service tới Controller bằng metadata/kết quả nội bộ; sơ đồ thể hiện phần dữ liệu LichHenResponse, không phải chữ ký Java đã biên dịch. Entity vẫn dùng void cho thay đổi trạng thái trong bộ nhớ; điều đó không mâu thuẫn với DTO mà Service trả về.')
paragraph('Sequence dùng thông điệp nghiệp vụ ở mức tổng quát. Lần đồng bộ này kiểm tra chữ ký thiết kế Controller/Service cho 21 thao tác; chưa tuyên bố kiểm chứng từng thông điệp Sequence hoặc toàn bộ repository method bằng mã Java.')
mapping_md += ['','## Quy ước và đồng bộ','']+[f'- {x}: {y}' for x,y in sync]+['','ActorContext lấy từ phiên. DTO HTTP được ánh xạ thành tham số Service; return type mô tả data, không gồm envelope/header/mã HTTP. UC09 cần metadata tạo mới để phân biệt 201/200. Các phương thức hỗ trợ HTTP và thông điệp Sequence chưa được xác nhận bằng backend chạy thật.']
(OUT/'DOI_CHIEU_THIET_KE.md').write_text('\n'.join(mapping_md),encoding='utf-8')

newpage('14 Câu hỏi bảo vệ và trả lời gợi ý')
paragraph('Các câu trả lời bám theo thiết kế hiện tại. Khi được hỏi kết quả chạy thực tế, chỉ dùng bằng chứng đã thực hiện; không trình bày mục tiêu đề xuất thành kết quả đo.')
for i,(q,a) in enumerate(QA,1):
 heading(f'{i} {q.rstrip("?")}',2);paragraph(a)
(OUT/'CAU_HOI_BAO_VE.md').write_text('# Câu hỏi bảo vệ TROHN\n\n'+'\n\n'.join(f'## {i} {q}\n\n{a}' for i,(q,a) in enumerate(QA,1)),encoding='utf-8')

heading('15 Tài liệu đối chiếu và phạm vi xác minh')
paragraph('Nguồn thiết kế: Dac-ta/Dac_ta_21_UC_dong_bo.docx; class-diagram/TROHN_Class_Diagram_Da_Chinh_Sua.drawio; API/API_DESIGN.md; Database/SQL/01_create_tables.sql; Database/TRANSACTIONS.md. Công nghệ frontend đối chiếu trohn/frontend/package.json. Tài liệu tham khảo về nền tảng luyện phỏng vấn AI được dùng để học cách tổ chức báo cáo; không sao chép nghiệp vụ, hạ tầng hoặc số đo của hệ thống đó.')
paragraph('Kiểm tra tĩnh gồm đủ 21 dòng UC, tồn tại phương thức Controller và Service, tên bảng đọc/ghi có trong SQL, chữ ký phần dữ liệu phù hợp hợp đồng HTTP. Chưa chạy SQL/MySQL, kiểm thử API, cạnh tranh hoặc hiệu năng. Class FULL vẫn gồm 41 loại được vẽ và 95 phương thức; DTO hỗ trợ chi tiết nằm trong API.')
for sec in d.sections:
 sec.header.paragraphs[0].text='TROHN | Thiết kế kiến trúc hệ thống'
 foot=sec.footer.paragraphs[0];foot.text='Trang ';foot.alignment=2
 fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');foot._p.append(fld)
for p in d.paragraphs:
 for r in p.runs:
  r.font.name='Arial'
 if p.style.name.startswith('Heading') or p.style.name=='Title':
  for r in p.runs:r.font.color.rgb=RGBColor(0,0,0)
 if p.style.name=='Title':
  for r in p.runs:r.font.size=Pt(24)
 if p.style.name=='Subtitle':
  for r in p.runs:r.font.color.rgb=RGBColor(0,0,0)
 if p.text=='2 Kiến trúc tổng thể':p.paragraph_format.page_break_before=True
for st in d.styles:
 for el in list(st.element.iter(qn('w:pBdr'))):el.getparent().remove(el)
for el in list(d.element.iter(qn('w:pBdr'))):el.getparent().remove(el)
d.save(OUT/'SYSTEM_ARCHITECTURE.docx')
shutil.copy2(OUT/'So-do/Kien_truc_tong_the.png',OUT/'SYSTEM_ARCHITECTURE.png')

def mdtable(headers,rows):return '\n'.join(['| '+' | '.join(headers)+' |','|'+'---|'*len(headers)]+['| '+' | '.join(r)+' |' for r in rows])
md=(BK/'Architecture/SYSTEM_ARCHITECTURE.md').read_text(encoding='utf-8').replace('Ngày 30/09/2026.','Cập nhật 14/10/2026.')
md=md.replace('## 2. Kiến trúc tổng thể','## 2. Kiến trúc tổng thể\n\n![Kiến trúc tổng thể](So-do/Kien_truc_tong_the.png)')
md+='\n\n## 9. Sơ đồ triển khai\n\nPhương án đề xuất, chưa phải hạ tầng đã chạy.\n\n![Local](So-do/Trien_khai_local.png)\n\n![Production](So-do/Trien_khai_production.png)'
md+='\n\n## 10. Công nghệ và trạng thái\n\n'+mdtable(['Công nghệ','Vai trò','Trạng thái'],TECH)
md+='\n\n## 11. Quyết định kiến trúc\n\n'+mdtable(['Quyết định','Lý do','Đánh đổi'],DECISIONS)
md+='\n\n## 12. Yêu cầu phi chức năng\n\nCác tiêu chí và số liệu là mục tiêu đề xuất, chưa đo.\n\n'+mdtable(['Mã','Tiêu chí','Kiểm chứng'],NFR)
md+='\n\n## 13. Đối chiếu thiết kế\n\n[21 UC với API, Controller, Service và bảng dữ liệu](DOI_CHIEU_THIET_KE.md). Chữ ký phần dữ liệu được đồng bộ; envelope HTTP do Controller bổ sung. 13 endpoint hỗ trợ không được tuyên bố đã vẽ đầy đủ trong Class Diagram.\n\n## 14. Chuẩn bị bảo vệ\n\n[15 câu hỏi và trả lời gợi ý](CAU_HOI_BAO_VE.md).\n'
(OUT/'SYSTEM_ARCHITECTURE.md').write_text(md,encoding='utf-8')

# Clarify DTO definitions in both API documents without rebuilding user formatting.
definitions='Bổ sung tên DTO ngày 14/10/2026: LuuYeuThichResponse = {tinId, saved}; TrangThaiTinResponse = {id, trangThai, version}. Đây là tên cho dữ liệu trả về đã thiết kế ở UC06 và UC14/19. TinQuanLyResponse, SuaTinRequest và Page được dùng thống nhất với Controller/Service; chi tiết DTO nằm ở các mục tương ứng.'
ap=ROOT/'API/API_DESIGN.md';s=(BK/'API/API_DESIGN.md').read_text(encoding='utf-8');s+='\n\n## 11. Đối chiếu chữ ký lớp\n\n'+definitions+'\n\nXem [bảng đối chiếu 21 UC](../Architecture/DOI_CHIEU_THIET_KE.md).\n';ap.write_text(s,encoding='utf-8')
ad=Document(ROOT/'API/THIET_KE_API_TROHN.docx')
for p in ad.paragraphs:
 if p.text.startswith('Một số tên DTO và kiểu trả về trong class diagram'):
  p.text='Controller/Service của 21 thao tác nghiệp vụ đã đồng bộ tên DTO, tham số ảnh, phân trang và kiểu dữ liệu trả về với API ngày 14/10/2026. Xem Architecture/DOI_CHIEU_THIET_KE.md. Envelope HTTP và metadata tạo mới của UC09 cần được hiện thực khi viết backend; chưa coi đây là bằng chứng mã triển khai đã chạy.'
if not any(p.text=='16 Đối chiếu tên DTO với Class Diagram' for p in ad.paragraphs):
 ad.add_heading('16 Đối chiếu tên DTO với Class Diagram',1);ad.add_paragraph(definitions)
try:ad.save(ROOT/'API/THIET_KE_API_TROHN.docx');print('API Word updated')
except PermissionError:ad.save(ROOT/'API/THIET_KE_API_TROHN.cap-nhat.docx');print('API Word locked; saved .cap-nhat.docx')
print('Architecture Word, Markdown, mapping, defense notes updated')
