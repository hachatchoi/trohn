from pathlib import Path
import re, shutil
from docx import Document
from docx.shared import Pt
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

root=Path('D:/Chuyên đề tổng hợp')
out=root/'Bao-cao-dong-bo/Kiem-tra-2026-10-15'
for rel in ['API/THIET_KE_API_TROHN.docx','Architecture/SYSTEM_ARCHITECTURE.docx']:
 src=root/rel
 shutil.copy2(src,out/(src.stem+'.before.docx'))
 d=Document(src)
 api=rel.startswith('API')
 groups=({1:(1,'Tổng quan và quy ước'),3:(2,'Danh mục API và đối chiếu thiết kế'),6:(3,'Hợp đồng dữ liệu và quy tắc xử lý'),15:(4,'Phạm vi và kiểm tra thiết kế')} if api else {1:(1,'Tổng quan kiến trúc hệ thống'),5:(2,'Xử lý nghiệp vụ và triển khai'),10:(3,'Công nghệ và yêu cầu chất lượng'),13:(4,'Liên kết thiết kế và xác minh')})
 major=minor=sub=0
 for p in list(d.paragraphs):
  text=p.text
  if p.style.name.startswith('Heading'):
   match=re.match(r'^(\d+)(?:\.(\d+))?\s+(.*)',text)
   old=int(match[1]) if match else None
   ismain=match and not match[2]
   if ismain:
    if old in groups:
     major,title=groups[old]; minor=0
     h=p.insert_paragraph_before(f'{major} {title}',style='Heading 1')
    minor+=1; sub=0
    p.text=f'{major}.{minor} {match[3]}'
    p.style='Heading 2'
   else:
    sub+=1
    label=match[3] if match else text
    p.text=f'{major}.{minor}.{sub} {label}'
    p.style='Heading 3'
  else:
   changes={'mục 3 và 4':'mục 2.1 và 2.2','quy ước mục 8':'quy ước mục 3.3','ở mục 5 của API/':'ở mục 2.3 của API/'}
   for a,b in changes.items():
    if a in p.text:
     for r in p.runs:
      r.text=r.text.replace(a,b)
  for br in list(p._p.xpath('.//w:br[@w:type="page"]')):
   br.getparent().remove(br)
  if not p.text.strip() and not p._p.xpath('.//w:drawing') and not p._p.xpath('.//w:sectPr'):
   p._p.getparent().remove(p._p)
 for name in ['Normal','Heading 1','Heading 2','Heading 3','Caption','Title','Subtitle']:
  s=d.styles[name].paragraph_format
  s.page_break_before=False
  s.space_before=Pt(8 if name.startswith('Heading') else 0)
  s.space_after=Pt(4)
  s.line_spacing=1.05
 for p in d.paragraphs:
  f=p.paragraph_format
  f.page_break_before=False
  f.space_before=Pt(8 if p.style.name.startswith('Heading') else 0)
  f.space_after=Pt(4)
  f.line_spacing=1.05
  f.keep_with_next=p.style.name.startswith('Heading') or bool(p._p.xpath('.//w:drawing'))
  f.keep_together=False
  if p.text.lstrip().startswith(('"','{','}',']')):
   f.space_after=Pt(0); f.line_spacing=1
 for t in d.tables:
  for ri,row in enumerate(t.rows):
   row.height=None
   if ri==0:
    pr=row._tr.get_or_add_trPr()
    if pr.find(qn('w:tblHeader')) is None: pr.append(OxmlElement('w:tblHeader'))
   for c in row.cells:
    for p in c.paragraphs:
     f=p.paragraph_format
     f.space_before=Pt(0); f.space_after=Pt(2); f.line_spacing=1
     f.keep_with_next=ri==0; f.keep_together=False; f.page_break_before=False
 target=out/src.name
 d.save(target)
 print(target)
 print('\n'.join(p.text for p in d.paragraphs if p.style.name.startswith('Heading')))
