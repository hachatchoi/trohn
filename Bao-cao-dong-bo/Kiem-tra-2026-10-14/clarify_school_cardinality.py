from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from docx import Document
from copy import deepcopy
import xml.etree.ElementTree as E
import shutil,hashlib
R=Path(__file__).resolve().parents[2];B=R/'Bao-cao-dong-bo/Kiem-tra-2026-10-14/Truoc-chu-thich-co-so';B.mkdir(exist_ok=True)
lines=[
'Mô hình vật lý: đầu nhiều là 0..*. Ít nhất một ảnh của tin đã lưu do Service bảo đảm. Nhật ký: đúng một FK mục tiêu khác NULL.',
'Trường đại học: nghiệp vụ 1..* cơ sở; FK chỉ bảo đảm cơ sở thuộc một trường. ERD vật lý vẫn là 0..*.',
'Kiểm tra khi nạp/cập nhật danh mục; 04_verify_data.sql phát hiện vi phạm, không tự ngăn ghi sai.']
images={}
for stem in ['TROHN_ERD_ChanChim','ChanChim_ChiTiet_4']:
 p=R/f'Database/ERD/{stem}.drawio';shutil.copy2(p,B/p.name);t=E.parse(p)
 c=next(c for c in t.iter('mxCell') if c.get('value','').startswith('Mô hình vật lý'))
 c.set('value','\n'.join(lines));c.set('style','text;html=0;fontSize=24;align=left;verticalAlign=top;whiteSpace=wrap;')
 g=c.find('mxGeometry');g.set('height','100');x=int(g.get('x'));y=int(g.get('y'));t.write(p,encoding='utf-8',xml_declaration=True)
 png=p.with_suffix('.png');shutil.copy2(png,B/png.name);oldhash=hashlib.sha256(png.read_bytes()).hexdigest()
 im=Image.open(png).convert('RGB');draw=ImageDraw.Draw(im);draw.rectangle((x-2,y-2,im.width-1,im.height-1),fill='white')
 font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',24)
 assert max(draw.textlength(l,font=font) for l in lines)<im.width-x-15
 for i,l in enumerate(lines):draw.text((x,y+6+i*29),l,font=font,fill='#17212B')
 im.save(png);images[oldhash]=png.read_bytes()
p=R/'Database/ERD/TROHN_ERD.drawio';shutil.copy2(p,B/p.name);shutil.copy2(R/'Database/ERD/TROHN_ERD_ChanChim.drawio',p)
p=R/'Database/THIET_KE_DATABASE_TROHN.docx';shutil.copy2(p,B/p.name);d=Document(p)
for rel in d.part.rels.values():
 if 'image' in rel.reltype:
  h=hashlib.sha256(rel.target_part.blob).hexdigest()
  if h in images:rel.target_part._blob=images[h]
note='Quy tắc nghiệp vụ: mỗi TruongDaiHoc phải có ít nhất một CoSoTruong (1..* trong Class Diagram). ERD vật lý ghi 0..* vì FK chỉ buộc mỗi cơ sở tham chiếu một trường tồn tại, không buộc trường phải có bản ghi con. Khi nạp/cập nhật danh mục, cần kiểm tra điều kiện này trước khi hoàn tất giao dịch, không để thao tác xóa hoặc chuyển cơ sở làm trường mất cơ sở cuối cùng. Truy vấn truong_thieu_co_so trong SQL/04_verify_data.sql phải trả về 0 dòng; đây là kiểm tra phát hiện vi phạm, không phải ràng buộc tự chặn mọi lần ghi.'
if not any(q.text.startswith('Quy tắc nghiệp vụ: mỗi TruongDaiHoc') for q in d.paragraphs):
 caption=next(q for q in d.paragraphs if q.text.startswith('Hình 5') and 'cơ sở' in q.text)
 pnew=d.add_paragraph(note);caption._p.addnext(pnew._p)
d.save(p)
for rel in ['Database/ERD/Quan_he.md','Database/Data_Dictionary.md']:
 p=R/rel;shutil.copy2(p,B/p.name);s=p.read_text(encoding='utf-8');s+='\n\n## Bội số trường đại học và cơ sở trường\n\n'+note+'\n';p.write_text(s,encoding='utf-8')
p=R/'Database/SQL/04_verify_data.sql';shutil.copy2(p,B/p.name);s=p.read_text(encoding='utf-8');s=s.replace('SELECT t.id AS truong_thieu_co_so','-- Business rule: every university must have at least one campus.\n-- This read-only query detects violations; it does NOT enforce writes.\n-- Validate the catalog transaction before completion, including deleting/moving the last campus.\nSELECT t.id AS truong_thieu_co_so');p.write_text(s,encoding='utf-8')
print('Updated main ERD + school detail, Word images and note, dictionary, relation notes and SQL comments; cardinality/schema unchanged.')
