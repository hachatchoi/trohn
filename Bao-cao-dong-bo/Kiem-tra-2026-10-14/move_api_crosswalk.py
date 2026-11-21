from pathlib import Path
from copy import deepcopy
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import re,shutil
R=Path(__file__).resolve().parents[2]
arch=R/'Architecture/SYSTEM_ARCHITECTURE.docx'
api=R/'API/THIET_KE_API_TROHN.docx'
source=api if api.exists() else R/'API/THIET_KE_API_TROHN.cap-nhat.docx'
b=R/'Bao-cao-dong-bo/Kiem-tra-2026-10-14/Truoc-chuyen-doi-chieu';b.mkdir(exist_ok=True)
for p in [arch,source]:shutil.copy2(p,b/p.name)
a=Document(arch);d=Document(source)
def text(el):return ''.join(el.itertext()) if False else ''.join(t.text or '' for t in el.iter(qn('w:t')))
body=a.element.body;els=list(body)
start=next(i for i,e in enumerate(els) if text(e)=='13 Đối chiếu use case API lớp và cơ sở dữ liệu')
end=next(i for i,e in enumerate(els) if text(e)=='14 Câu hỏi bảo vệ và trả lời gợi ý')
block=els[start:end]
# Remove the trailing page-break paragraph; the destination has its own next section.
while block and not text(block[-1]):block.pop()
insert=next(p._p for p in d.paragraphs if p.text=='5 Request và response của 21 API nghiệp vụ')
for p in d.paragraphs:
 if p.style.name.startswith('Heading'):
  m=re.match(r'^(\d+) (.*)',p.text)
  if m and int(m[1])>=5:p.text=f'{int(m[1])+1} {m[2]}'
for e in d.element.body.iter(qn('w:t')):
 if e.text:e.text=re.sub(r'mục (\d+)\b',lambda m:'mục '+str(int(m[1])+1) if int(m[1])>=5 else m[0],e.text)
for e in block:
 copy=deepcopy(e)
 for t in copy.iter(qn('w:t')):
  if not t.text:continue
  if t.text=='13 Đối chiếu use case API lớp và cơ sở dữ liệu':t.text='5 Đối chiếu use case API lớp và cơ sở dữ liệu'
  else:t.text=re.sub(r'^13 ([1-5]) ',r'5.\1 ',t.text)
 insert.addprevious(copy)
for e in els[start:end]:body.remove(e)
anchor=next(p._p for p in a.paragraphs if p.text=='14 Câu hỏi bảo vệ và trả lời gợi ý')
summary=[('13 Luồng xử lý và liên kết với thiết kế API','Heading 1'),
('Luồng tổng thể: Controller nhận HTTP và ánh xạ DTO → Service kiểm tra quyền, điều kiện nghiệp vụ và điều phối transaction → Repository đọc/ghi MySQL. Backend tự tạo ActorContext từ phiên hợp lệ; không tin vai trò hay người thao tác do client gửi.','Normal'),
('Ví dụ UC09 đặt lịch: POST /api/v1/appointments → LichHenController.datLich → LichHenService.datLich. Service kiểm tin công khai, tài khoản hoạt động, thời điểm hẹn và lịch trùng; Repository đọc TaiKhoan, TinDang, LichHen và lưu LichHen trong transaction. Trả 201 khi tạo mới hoặc 200 với lịch hoạt động trùng hiện có.','Normal'),
('Bảng đối chiếu chi tiết 21 UC, endpoint, phương thức Controller/Service, dữ liệu đọc/ghi và quy ước chữ ký nằm ở mục 5 của API/THIET_KE_API_TROHN.docx. Bản tra cứu văn bản: API/DOI_CHIEU_THIET_KE.md. Phần kiến trúc chỉ trình bày quan hệ giữa các tầng và ví dụ đại diện.','Normal')]
for txt,style in summary:
 p=a.add_paragraph(txt,style);anchor.addprevious(p._p)
for p in a.paragraphs:
 for r in p.runs:
  if 'Architecture/DOI_CHIEU_THIET_KE.md' in r.text:r.text=r.text.replace('Architecture/DOI_CHIEU_THIET_KE.md','API/DOI_CHIEU_THIET_KE.md')
a.save(arch);d.save(api)
# Keep the previously delivered alternate file consistent, so it cannot lead back to the old layout.
shutil.copy2(api,R/'API/THIET_KE_API_TROHN.cap-nhat.docx')
old=R/'Architecture/DOI_CHIEU_THIET_KE.md';new=R/'API/DOI_CHIEU_THIET_KE.md'
shutil.copy2(old,b/'DOI_CHIEU_THIET_KE.md');shutil.copy2(old,new)
old.write_text('# Đối chiếu thiết kế đã chuyển sang tài liệu API\n\nXem [bảng đối chiếu 21 UC](../API/DOI_CHIEU_THIET_KE.md) hoặc mục 5 của [Word thiết kế API](../API/THIET_KE_API_TROHN.docx).\n',encoding='utf-8')
p=R/'Architecture/SYSTEM_ARCHITECTURE.md';s=p.read_text(encoding='utf-8')
s=re.sub(r'## 13\. Đối chiếu thiết kế.*?(?=## 14\.)','## 13. Luồng xử lý và liên kết với API\n\n'+ '\n\n'.join(x[0] for x in summary[1:])+'\n\n',s,flags=re.S);p.write_text(s,encoding='utf-8')
p=R/'API/API_DESIGN.md';s=p.read_text(encoding='utf-8').replace('../Architecture/DOI_CHIEU_THIET_KE.md','DOI_CHIEU_THIET_KE.md');s+='\n\nBảng đối chiếu chi tiết được đặt sau danh sách endpoint trong mục 5 của bản Word; phần kiến trúc chỉ giữ luồng tổng thể và ví dụ UC09.\n';p.write_text(s,encoding='utf-8')
for rel in ['Bao-cao-dong-bo/README.md','Bao-cao-dong-bo/Kiem-tra-2026-10-14/Ket_qua.md','class-diagram/Ghi_chu_chinh_sua.md','Bao-cao-dong-bo/Class-Diagram/Ghi_chu_chinh_sua.md']:
 p=R/rel;s=p.read_text(encoding='utf-8').replace('Architecture/DOI_CHIEU_THIET_KE.md','API/DOI_CHIEU_THIET_KE.md');p.write_text(s,encoding='utf-8')
assert sum(len(t.rows)-1 for t in d.tables if t.cell(0,0).text=='UC và endpoint')==21
assert not any(t.cell(0,0).text=='UC và endpoint' for t in a.tables)
print('Moved 21 UC rows and signature conventions to API section 5; architecture now holds summary and example.')
