from pathlib import Path
import xml.etree.ElementTree as E
import shutil, zipfile, json, re
from docx import Document
from docx.shared import Pt

BASE=Path(__file__).resolve().parent.parent
OUT=Path(__file__).resolve().parent
for name in ['Dac-ta','Activity/preview','Sequence/preview','Sequence/drawio','Class-Diagram']:
 (OUT/name).mkdir(parents=True,exist_ok=True)

doc=Document(BASE/'Dac-ta-UC/Dac_ta_UC_da_ra_soat_de_ve_Activity_Sequence.docx')
def setcell(cell,text):
 p=cell.paragraphs[0]
 for child in list(cell._tc):
  if child.tag.endswith('}p') and child is not p._p: cell._tc.remove(child)
 p.text=text
def row(uc,key):
 return next(r.cells[1] for r in doc.tables[uc+4].rows if r.cells[0].text==key)
branches=row(14,'Nhánh và điểm đến')
setcell(branches,branches.text.replace('4b. Tin đang Admin ẩn. → Báo tin đã bị quản trị xử lý, giữ nguyên lý do Admin.', '4b. Tin Bị từ chối, Admin ẩn hoặc Ẩn do khóa tài khoản. → Báo trạng thái hiện tại không cho phép tự ẩn; giữ nguyên trạng thái và lý do.'))
rule='Chỉ Chờ duyệt hoặc Đang hiển thị được chuyển sang Chủ trọ ẩn. Đã Chủ trọ ẩn: trả trạng thái hiện có, không ghi và không hủy lịch lặp. Bị từ chối, Admin ẩn hoặc Ẩn do khóa tài khoản: từ chối, giữ nguyên dữ liệu. Trước khi ghi phải kiểm tra lại quyền và trạng thái trong giao dịch; nếu đã đổi, xử lý theo nhánh 4b hoặc 4c. Tin đã ẩn không được duyệt bằng yêu cầu cũ. Muốn đăng lại dùng UC13 rồi UC17. Không xóa lịch hoặc tin khỏi lịch sử.'
setcell(row(14,'Quy tắc'),rule)
main=row(14,'Luồng chính')
setcell(main,main.text.replace('4. Hệ thống kiểm tra lý do, quyền và trạng thái tin mới nhất.','4. Hệ thống kiểm tra lý do, quyền và trạng thái tin mới nhất; chỉ cho phép Chờ duyệt hoặc Đang hiển thị đi tiếp bước 5.').replace('cùng lý do, trong một giao dịch.','cùng lý do, nguồn hủy Hệ thống, người thực hiện thao tác và thời điểm hủy, trong một giao dịch.'))
for p in doc.paragraphs:
 if p.text=='UC14  Ẩn tin': p.text='UC14  Chủ trọ ẩn tin'
 if p.text=='UC19  Ẩn tin đăng': p.text='UC19  Admin ẩn tin đăng'
for r in doc.tables[4].rows:
 if r.cells[0].text=='UC14': setcell(r.cells[1],'Chủ trọ ẩn tin')
 if r.cells[0].text=='UC19': setcell(r.cells[1],'Admin ẩn tin đăng')
for r in doc.tables[3].rows:
 if r.cells[0].text=='Tin đăng': setcell(r.cells[1],r.cells[1].text.replace('UC14 đưa về Chủ trọ ẩn.','UC14 chỉ chuyển Chờ duyệt hoặc Đang hiển thị về Chủ trọ ẩn.'))
doc.paragraphs[2].add_run(' Bản đồng bộ ngày 24/09/2026 làm rõ UC14 theo Class Diagram đã chỉnh sửa; giữ nguyên mã UC và các bước còn lại.')
doc.save(OUT/'Dac-ta/Dac_ta_21_UC_dong_bo.docx')

def update_diagram(di,activity=False):
 if di.get('name') in ['UC14 – Ẩn tin','UC14 - Ẩn tin']: di.set('name','UC14 – Chủ trọ ẩn tin')
 for c in di.findall('.//mxCell'):
  v=c.get('value','')
  if v=='UC14 – Ẩn tin': c.set('value','UC14 – Chủ trọ ẩn tin')
  if activity:
   ids={
    'text_box_e41':'Bị từ chối / Admin ẩn /\nẨn do khóa tài khoản',
    'n43':'Báo trạng thái không cho phép tự ẩn.\nGiữ nguyên trạng thái và lý do.\nKết thúc; không ghi thay đổi.',
    'n63':'5. Chuyển tin sang Chủ trọ ẩn; hủy\nlịch tương lai còn hoạt động. Lưu lý do,\nnguồn Hệ thống, người và thời điểm hủy.\nCùng giao dịch; kiểm tra lại quyền và\ntrạng thái. Nếu đổi, xử lý như bước 4.',
    'label15':'Quy tắc: Chỉ Chờ duyệt / Đang hiển thị được tự ẩn. Đã Chủ trọ ẩn: trả kết quả hiện có, không hủy lịch lặp. Các trạng thái còn lại: từ chối, giữ dữ liệu. Đăng lại qua sửa tin và duyệt tin; không xóa lịch sử.'}
   if c.get('id') in ids:
    c.set('value',ids[c.get('id')])
    g=c.find('mxGeometry')
    if c.get('id')=='text_box_e41': g.set('width','280');g.set('height','55');g.set('x','450');g.set('y','2965')
    if c.get('id')=='label15':g.set('height','85')
  else:
   v=c.get('value','')
   v=v.replace('[tin đang Admin ẩn]','[tin Bị từ chối / Admin ẩn / Ẩn do khóa tài khoản]')
   v=v.replace('Giữ trạng thái và lý do của Admin;\nkhông xử lý','Giữ trạng thái và lý do hiện có;\nkhông được tự ẩn')
   v=v.replace('[tin còn được chủ trọ ngừng đăng]','[tin Chờ duyệt hoặc Đang hiển thị]')
   v=v.replace('Khóa tin; kiểm tra điều kiện; UPDATE trạng thái Chủ trọ ẩn, lý do','Khóa tin; chỉ Chờ duyệt / Đang hiển thị → Chủ trọ ẩn; lưu lý do')
   v=v.replace('UPDATE lich SET Đã hủy, lý do WHERE tin_id=:id AND giờ > hiện tại AND\ntrạng thái hoạt động','UPDATE lịch tương lai còn hoạt động của tin: Đã hủy, lý do,\nnguồn Hệ thống, người thao tác, thời điểm hủy')
   c.set('value',v)

a=E.parse(r'C:/Users/00012/Downloads/Activity_UC01_UC21_text_chinh_sua.drawio')
update_diagram(a.getroot().findall('diagram')[13],True)
def save(tree,p): E.indent(tree);tree.write(p,encoding='utf-8',xml_declaration=True)
save(a,OUT/'Activity/Activity_21_UC_dong_bo.drawio')
for p in (BASE/'Activity-All/preview').glob('*.png'):shutil.copy2(p,OUT/'Activity/preview'/p.name)
s=E.parse(BASE/'Sequence-All/Bo_21_Sequence_UC01_UC21.drawio')
for di in s.getroot().findall('diagram'):
 if di.get('name','').startswith('UC14'):update_diagram(di)
save(s,OUT/'Sequence/Sequence_21_UC_dong_bo.drawio')
for p in (BASE/'Sequence-All/drawio').glob('*.drawio'):
 t=E.parse(p)
 if p.name.startswith('UC14'):
  for di in t.getroot().findall('diagram'):update_diagram(di)
 save(t,OUT/'Sequence/drawio'/p.name)
for p in (BASE/'Sequence-All/preview').glob('*.png'):shutil.copy2(p,OUT/'Sequence/preview'/p.name)
for p in (BASE/'Class-Diagram/Da-chinh-sua').iterdir():
 if p.is_file() and p.suffix!='.zip':shutil.copy2(p,OUT/'Class-Diagram'/p.name)
shutil.copytree(BASE/'Class-Diagram/Da-chinh-sua/preview',OUT/'Class-Diagram/preview',dirs_exist_ok=True)
(OUT/'README.md').write_text('''# Bộ tài liệu TROHN dùng cho báo cáo

Phiên bản ngày 24/09/2026. Dùng các file trong thư mục này khi lấy nội dung báo cáo. Bản gốc ở các thư mục cũ được giữ để đối chiếu.

## Nội dung

- Dac-ta/Dac_ta_21_UC_dong_bo.docx: đặc tả 21 UC, đã sửa UC14.
- Activity/Activity_21_UC_dong_bo.drawio: 21 trang Activity.
- Sequence/Sequence_21_UC_dong_bo.drawio: 21 trang chính và 21 trang xử lý lỗi; file riêng từng UC ở drawio.
- Class-Diagram: bản Class Diagram đã chỉnh, 6 trang, 11 Entity.

## Thay đổi đồng bộ

UC14 chỉ chuyển Chờ duyệt hoặc Đang hiển thị sang Chủ trọ ẩn. Tin đã Chủ trọ ẩn trả kết quả hiện có, không ghi/hủy lặp. Tin Bị từ chối, Admin ẩn hoặc Ẩn do khóa tài khoản bị từ chối thao tác, giữ nguyên dữ liệu. Nhánh này đã sửa trực tiếp ở đặc tả, Activity và Sequence, không chỉ thêm ghi chú.

Ẩn tin và hủy lịch tương lai còn hoạt động nằm trong cùng giao dịch. Ghi lý do, nguồn Hệ thống, người thực hiện thao tác và thời điểm hủy. Kiểm tra lại quyền/trạng thái trước ghi; khi trạng thái đổi thì đi theo nhánh tương ứng. Không thực hiện nhánh thành công sau lỗi.

UC14 trong danh mục Word đổi tên thành Chủ trọ ẩn tin; UC19 thành Admin ẩn tin đăng để phân biệt tác nhân. Số UC không đổi. Các trang khác được giữ nguyên từ bộ hiện có.

## Phạm vi và cách sử dụng

Đợt này đồng bộ quy tắc UC14 được nêu trong lần sửa Class Diagram. Không coi đây là xác nhận toàn bộ tên phương thức trong 21 Sequence đã trùng từng chữ với thiết kế lớp. Các chữ ký kỹ thuật, DTO và thiết kế database/API cần được rà soát khi triển khai backend. Chưa thay đổi frontend, Jira hoặc database.

Các quyết định ChiPhiPhong, địa chỉ tách trường, cơ sở trường và tọa độ được trình bày trong Class Diagram. Không mặc định tất cả quyết định cấu trúc dữ liệu đều tạo thêm bước thao tác hoặc UC mới.

Khi viết báo cáo: dùng tên UC theo bảng đặc tả; mô tả quy tắc UC14 như trên; lấy hình lớp nghiệp vụ ở Class-Diagram/preview/01.png. Các quy tắc đề xuất phải được nhóm hiểu và xác nhận với giảng viên/người dùng, không được trình bày như kết quả khảo sát đã thực hiện.
''',encoding='utf-8')
# Correct the historical scope statement in the copied class notes only.
note=OUT/'Class-Diagram/Ghi_chu_chinh_sua.md'
txt=note.read_text(encoding='utf-8').replace('Cần đồng bộ cách diễn đạt này khi cập nhật đặc tả/Activity/Sequence.','Đã đồng bộ UC14 trong bộ Bao-cao-dong-bo ngày 24/09/2026.').replace('bộ đặc tả/Sequence/Activity cũ chưa được thay đổi.','bộ đặc tả/Sequence/Activity gốc chưa được thay đổi; bản sao đồng bộ UC14 nằm trong Bao-cao-dong-bo.')
note.write_text(txt,encoding='utf-8')
print('Written synchronized sources',flush=True)
