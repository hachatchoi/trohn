from pathlib import Path
import re,json
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
R=Path(__file__).resolve().parents[2]
doc=Document();sec=doc.sections[0];sec.page_width=Inches(8.5);sec.page_height=Inches(11)
sec.top_margin=sec.bottom_margin=Inches(.65);sec.left_margin=sec.right_margin=Inches(.7)
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Caption']:
 st=doc.styles[name];st.font.name='Arial';st.font.color.rgb=RGBColor(0,0,0)
for st in doc.styles:
 for el in list(st.element.iter(qn('w:pBdr'))):el.getparent().remove(el)
doc.styles['Normal'].font.size=Pt(11);doc.styles['Normal'].paragraph_format.space_after=Pt(6)
doc.styles['Normal'].paragraph_format.line_spacing=1.08
doc.styles['Title'].font.size=Pt(24);doc.styles['Heading 1'].font.size=Pt(16);doc.styles['Heading 2'].font.size=Pt(13)
footer=sec.footer.paragraphs[0];footer.alignment=2;footer.add_run('Trang ')
field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)
def p(t,style=None):return doc.add_paragraph(t,style)
def heading(t):doc.add_heading(t,1)
def table(headers,rows,widths):
 t=doc.add_table(rows=1,cols=len(headers));t.autofit=False
 for col,w in zip(t.columns,widths):col.width=Inches(w)
 for c,h in zip(t.rows[0].cells,headers):c.text=h
 t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
 for row in rows:
  for c,txt in zip(t.add_row().cells,row):c.text=str(txt)
 for i,row in enumerate(t.rows):
  row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
  for c,w in zip(row.cells,widths):
   c.width=Inches(w);c.vertical_alignment=1;cp=c._tc.get_or_add_tcPr()
   sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'E6E6E6' if i==0 else 'FFFFFF');cp.append(sh)
   borders=OxmlElement('w:tcBorders');m=OxmlElement('w:tcMar')
   for side in ('top','bottom','left','right'):
    b=OxmlElement('w:'+side);b.set(qn('w:val'),'single');b.set(qn('w:sz'),'4');b.set(qn('w:color'),'D9D9D9');borders.append(b)
    e=OxmlElement('w:'+side);e.set(qn('w:w'),'80');e.set(qn('w:type'),'dxa');m.append(e)
   cp.append(borders);cp.append(m)
   for para in c.paragraphs:
    para.paragraph_format.space_after=Pt(2);para.paragraph_format.line_spacing=1.0
    for run in para.runs:run.font.size=Pt(10);run.bold=i==0
 p('');return t
sec.header.paragraphs[0].text='TROHN  |  Thiết kế REST API'
md=(R/'API/API_DESIGN.md').read_text(encoding='utf-8')
sections={}
for part in re.split(r'^## ',md,flags=re.M)[1:]:
 title,content=part.split('\n',1);sections[int(title.split('.')[0])]=(title,content.strip())
ucs=[]
for line in sections[3][1].splitlines():
 if re.match(r'^\| UC\d+',line):
  uc,ep,role,req,res=[x.strip() for x in line.strip('|').split('|')]
  method,path=ep.split(' ',1);ucs.append((uc,method,path,role,req,res))
support=[]
for line in sections[9][1].splitlines():
 if line.startswith('| GET '):
  ep,role,result=[x.strip() for x in line.strip('|').split('|')];method,path=ep.split(' ',1);support.append((method,path,role,result))
support.insert(0,('GET','/appointments/{id}','KHACH_THUE sở hữu lịch hoặc CHU_TRO của tin','id; 200 LichHenResponse; cùng phạm vi UC11'))
names=['Xem chi tiết lịch hẹn','Xem tài khoản hiện tại','Lấy CSRF token','Xem tin của chủ trọ','Xem chi tiết tin của chủ trọ','Lấy danh mục tiện ích','Lấy danh sách trường','Lấy cơ sở của trường','Admin xem danh sách tin','Admin xem chi tiết tin','Admin xem danh sách tài khoản','Admin xem chi tiết tài khoản','Tải ảnh phòng có kiểm quyền']
def clean(s):return s.replace('`','').replace('**','')
def prose(content):
 lines=content.splitlines();i=0
 while i<len(lines):
  line=lines[i].strip()
  if not line:i+=1;continue
  if line.startswith('```'):
   data=[];i+=1
   while i<len(lines) and not lines[i].startswith('```'):data.append(lines[i]);i+=1
   obj=json.loads('\n'.join(data));formatted=json.dumps(obj,ensure_ascii=False,indent=2)
   for l in formatted.splitlines():
    para=p(l);para.paragraph_format.space_after=Pt(0)
    for run in para.runs:run.font.name='Consolas';run.font.size=Pt(9)
   i+=1;continue
  if line.startswith('|'):
   rows=[]
   while i<len(lines) and lines[i].strip().startswith('|'):
    values=[clean(x.strip()) for x in lines[i].strip().strip('|').split('|')]
    if not all(re.fullmatch(r'[-: ]+',x) for x in values):rows.append(values)
    i+=1
   if len(rows[0])==3:widths=[.9,2.9,3.3]
   else:widths=[7.1/len(rows[0])]*len(rows[0])
   table(rows[0],rows[1:],widths);continue
  p(clean(line[2:] if line.startswith('- ') else line));i+=1

doc.add_paragraph('Thiết kế API hệ thống TROHN','Title')
p('Bảng đặc tả endpoint và hợp đồng trao đổi dữ liệu','Subtitle')
p('Tài liệu phục vụ báo cáo tiến độ lần 2 ngày 15/10/2026. Bản Word được lập ngày 14/10/2026 từ API/API_DESIGN.md, theo phạm vi 21 use case và thiết kế database hiện tại. API đang ở mức thiết kế, chưa có backend triển khai để xác nhận chạy thực tế.')
heading('1 Vai trò của kiến trúc tổng thể và API')
p('Kiến trúc tổng thể mô tả các thành phần và cách chúng phối hợp: giao diện React gửi yêu cầu tới backend Spring Boot; Spring Security kiểm tra phiên và quyền; Controller nhận dữ liệu, Service xử lý nghiệp vụ, Repository đọc ghi MySQL. ImageStorage quản lý ảnh và GeoService tính khoảng cách tới cơ sở trường.')
p('Thiết kế API là hợp đồng giữa giao diện và backend: endpoint là đường dẫn; method là kiểu yêu cầu HTTP; chức năng mô tả thao tác; quyền hạn quy định ai được gọi. Request là dữ liệu gửi lên, response là kết quả trả về. Ví dụ khách thuê gọi POST /api/v1/appointments để đặt lịch; backend kiểm tra quyền và điều kiện rồi trả 201 cùng dữ liệu lịch mới.')
p('GET đọc dữ liệu; POST tạo dữ liệu hoặc thực hiện lệnh nghiệp vụ; PUT thay nội dung hoặc đặt trạng thái tài nguyên theo hợp đồng; DELETE bỏ tài nguyên hoặc quan hệ được cho phép. Không tự thêm PATCH nếu thiết kế TROHN chưa dùng phương thức này.')
heading('2 Quy ước đọc bảng đặc tả')
p('Base path: /api/v1. Hai bảng danh mục ở mục 3 và 4 ghi đầy đủ tiền tố này; các bảng và phần diễn giải sau đó có thể lược bỏ /api/v1. Địa chỉ backend phát triển dự kiến: http://127.0.0.1:8080. Chưa có địa chỉ production được xác nhận.')
p('Công khai nghĩa là không yêu cầu đăng nhập, nhưng vẫn kiểm tra dữ liệu và trạng thái công khai. KHACH_THUE là khách thuê; CHU_TRO là chủ trọ; ADMIN là quản trị viên. Quyền sở hữu được backend xác minh từ phiên, không dựa vào userId hoặc actorId do trình duyệt gửi.')
doc.add_page_break();heading('3 Bảng đặc tả API theo chức năng')
p('Bảng dùng bốn cột theo mẫu yêu cầu. Tên API là tên thao tác đề xuất kèm chức năng; mã UC chỉ dùng để đối chiếu nghiệp vụ ở phần đặc tả chi tiết. Endpoint và method xác định thao tác HTTP.')
api_names=['register — Đăng ký tài khoản', 'login — Đăng nhập', 'logout — Đăng xuất', 'searchListings — Tìm kiếm phòng', 'getListing — Lấy chi tiết phòng', 'addFavorite — Thêm phòng yêu thích', 'removeFavorite — Bỏ phòng yêu thích', 'listFavorites — Lấy danh sách yêu thích', 'createAppointment — Đặt lịch xem phòng', 'cancelAppointment — Hủy lịch xem phòng', 'listAppointments — Lấy danh sách lịch hẹn', 'createListing — Tạo tin đăng', 'updateListing — Cập nhật tin đăng', 'hideOwnListing — Chủ trọ ẩn tin', 'confirmAppointment — Xác nhận lịch hẹn', 'rejectAppointment — Từ chối lịch hẹn', 'approveListing — Duyệt tin đăng', 'rejectListing — Từ chối tin đăng', 'hideListingByAdmin — Admin ẩn tin', 'lockUser — Khóa tài khoản', 'unlockUser — Mở khóa tài khoản']
rows=[]
for uc,method,path,role,req,res in ucs:
 role={'Khách sở hữu':'KHACH_THUE sở hữu lịch','Chủ sở hữu':'CHU_TRO sở hữu tin','Chủ của tin':'CHU_TRO sở hữu tin được hẹn'}.get(role,role)
 rows.append(['/api/v1'+path,method,api_names[len(rows)],role])
table(['Endpoint','Method','Tên API và chức năng','Quyền hạn Auth và Role'],rows,[2.45,.85,1.8,2.0])
p('UC03: phiên còn hiệu lực cần CSRF; phiên hết hạn hoặc không tồn tại chỉ xóa cookie sau khi kiểm tra Origin. UC14, UC19, UC20 và UC21 đã ở trạng thái đích thì trả kết quả hiện có, không thực hiện lặp tác động.')
heading('4 API đọc hỗ trợ giao diện')
p('Các API sau hỗ trợ hiển thị, tra cứu và xác thực cho phạm vi hiện tại, không bổ sung use case nghiệp vụ ghi mới. API chi tiết lịch hẹn thuộc UC11.')
table(['Endpoint','Method','Tên API và chức năng','Quyền hạn Auth và Role'],[['/api/v1'+path,m,n,role] for (m,path,role,_),n in zip(support,names)],[2.45,.85,1.8,2.0])
doc.add_page_break();heading('5 Request và response của 21 API nghiệp vụ')
p('Mọi response JSON thành công dùng envelope data, message và requestId; bảng mô tả phần dữ liệu và mã HTTP. Response 204 không có body. Trường id hoặc tinId trong đường dẫn phải là số nguyên dương. Endpoint GET không yêu cầu JSON body.')
for title,subset in [('Tài khoản',ucs[:3]),('Tìm phòng và yêu thích',ucs[3:8]),('Lịch hẹn',ucs[8:11]+ucs[14:16]),('Tin đăng',ucs[11:14]+ucs[16:19]),('Quản lý tài khoản',ucs[19:])]:
 doc.add_heading(title,2)
 rows=[]
 for uc,m,path,role,req,res in subset:
  req=req.replace('Bộ lọc mục 5','Query tìm kiếm được mô tả ở mục 9').replace('Bộ lọc mục 7','Query lịch hẹn được mô tả ở mục 11')
  if '{id}' in path:req='Path id; '+req
  if '{tinId}' in path:req='Path tinId; '+req
  rows.append([uc.split(' ',1)[0]+'\n'+m+' '+path,req,res])
 table(['API','Request và tham số','Response thành công'],rows,[2.55,2.25,2.3])
heading('6 Query và response của API hỗ trợ')
support_rows=[]
for _,path,_,result in support:
 query='Không có'
 if '{id}' in path:query='Path id'
 elif '{tinId}' in path:query='Path tinId và photoId'
 elif path in ('/me/listings','/admin/listings'):query='trangThai, page, size'
 elif path=='/admin/users':query='q, vaiTro, trangThai, page, size'
 support_rows.append([path,query,result])
table(['Endpoint GET sau api v1','Query hoặc path','Dữ liệu kết quả'],support_rows,[2.55,1.45,3.1])
p('Các API hỗ trợ trả HTTP 200 khi đọc thành công. Ảnh trả nội dung nhị phân JPEG, PNG hoặc WebP, không bọc JSON. Không có body đầu vào. Quyền xem chi tiết theo cùng phạm vi danh sách; ảnh phải thuộc đúng tin. API riêng tư và ảnh dùng Cache-Control: no-store.')
heading('7 Xác thực phiên và quy tắc chung')
prose(sections[1][1]);prose(sections[2][1])
heading('8 Đặc tả dữ liệu tài khoản')
prose(sections[4][1])
heading('9 Đặc tả tìm kiếm và chi tiết phòng')
prose(sections[5][1])
heading('10 Đặc tả tạo sửa và ẩn tin')
prose(sections[6][1])
heading('11 Đặc tả yêu thích và lịch hẹn')
prose(sections[7][1])
heading('12 Đặc tả API quản trị')
prose(sections[8][1])
heading('13 Ví dụ request và response')
p('Ví dụ minh họa hợp đồng UC09, không phải kết quả gọi backend thật. Giả sử gửi yêu cầu trước thời điểm hẹn và tin đang công khai; cookie phiên cùng CSRF token được trình duyệt gửi theo quy ước mục 7.')
p('POST /api/v1/appointments   Content-Type: application/json')
request={'tinId':12,'thoiDiemHen':'2026-10-20T09:00:00+07:00','soDienThoaiLienHe':'0900000001','ghiChu':'Tôi muốn xem phòng buổi sáng.'}
prose('```json\n'+json.dumps(request,ensure_ascii=False)+'\n```')
p('HTTP 201 khi tạo mới. Phần data là LichHenResponse; nếu trùng lịch hoạt động khách–tin–giờ thì trả HTTP 200 cùng lịch hiện có.')
response={'data':{'id':101,'tinId':12,'khachThueId':7,'thoiDiemHen':'2026-10-20T02:00:00Z','soDienThoaiLienHe':'0900000001','ghiChu':'Tôi muốn xem phòng buổi sáng.','trangThai':'CHO_XAC_NHAN','lyDoTuChoi':None,'lyDoHuy':None,'nguonHuy':None,'nguoiHuyId':None,'huyLuc':None,'ngayTao':'2026-10-14T03:00:00Z','ngayCapNhat':'2026-10-14T03:00:00Z','version':0},'message':'Đặt lịch thành công','requestId':'demo-request-001'}
prose('```json\n'+json.dumps(response,ensure_ascii=False)+'\n```')
p('Ví dụ lỗi HTTP 409 khi xác nhận một lịch xung đột với lịch đã xác nhận của cùng chủ tại cùng thời điểm:')
prose('```json\n'+json.dumps({'error':{'code':'APPOINTMENT_CONFLICT','message':'Chủ trọ đã có lịch được xác nhận tại thời điểm này.','fields':{}},'requestId':'demo-request-002'},ensure_ascii=False)+'\n```')
heading('14 Phạm vi và kiểm tra trước triển khai')
p('Không có API thanh toán, hợp đồng, báo cáo vi phạm, đổi mật khẩu, cập nhật hồ sơ, xóa tin, hiện tin trực tiếp hoặc thống kê trong bộ 21 UC này. Không có API quản lý nhật ký riêng; nhật ký được ghi khi xử lý nghiệp vụ.')
prose(sections[10][1])
p('Controller/Service của 21 thao tác nghiệp vụ đã đồng bộ tên DTO, tham số ảnh, phân trang và kiểu dữ liệu trả về với API ngày 14/10/2026. Xem Architecture/DOI_CHIEU_THIET_KE.md. Envelope HTTP và metadata tạo mới của UC09 cần được hiện thực khi viết backend; chưa coi đây là bằng chứng mã triển khai đã chạy.')
heading('15 Nguồn thiết kế')
p('API/API_DESIGN.md là nguồn hợp đồng API. Database/Data_Dictionary.md xác định giới hạn cột; Database/TRANSACTIONS.md xác định giao dịch và cạnh tranh. Đặc tả 21 UC và bộ Class Diagram 6 trang trong Bao-cao-dong-bo là phạm vi nghiệp vụ. Bản Word chuyển cách trình bày theo mẫu, không tự mở rộng chức năng.')
heading('16 Đối chiếu tên DTO với Class Diagram')
prose(sections[11][1])
out=R/'API/THIET_KE_API_TROHN.docx';doc.save(out)
assert len(ucs)==21 and len(support)==13
assert len({(m,path) for _,m,path,_,_,_ in ucs}|{(m,path) for m,path,_,_ in support})==34
print(out);print('PASS: 21 use cases; 13 supporting endpoints; 34 unique method/path pairs.')

