from architecture_data import *
import xml.etree.ElementTree as E
import hashlib,json,re
from docx import Document
sql=(ROOT/'Database/SQL/01_create_tables.sql').read_text(encoding='utf-8');tables=set(re.findall(r'CREATE TABLE (\w+)',sql))
src=ROOT/'class-diagram/TROHN_Class_Diagram_Da_Chinh_Sua.drawio'
other=ROOT/'Bao-cao-dong-bo/Class-Diagram/TROHN_Class_Diagram_Da_Chinh_Sua.drawio'
assert src.read_bytes()==other.read_bytes()
def classes(path):
 data={}
 for dia in E.parse(path).findall('diagram'):
  cs=list(dia.iter('mxCell'))
  for c in cs:
   if c.get('value','').startswith(('«controller»','«service»')):
    name=c.get('value').split('\n')[-1];data[name]='\n'.join(x.get('value','') for x in cs if x.get('parent')==c.get('parent') and x.get('value','').startswith('+'))
 return data
cl=classes(src);full=classes(ROOT/'Bao-cao-dong-bo/Class-Diagram/Tong-hop/TROHN_Class_Diagram_FULL.drawio');assert cl==full
api=api_rows();assert len(api)==21 and set(api)=={x[0] for x in MAPPING}
expected={1:'TaiKhoanResponse',2:'DangNhapResponse',3:'void',4:'Page<TinTomTat>',5:'ChiTietTinResponse',6:'LuuYeuThichResponse',7:'void',8:'Page<YeuThichResponse>',9:'LichHenResponse',10:'LichHenResponse',11:'Page<LichHenResponse>',12:'TinQuanLyResponse',13:'TinQuanLyResponse',14:'TrangThaiTinResponse',15:'LichHenResponse',16:'LichHenResponse',17:'TinQuanLyResponse',18:'TinQuanLyResponse',19:'TrangThaiTinResponse',20:'TaiKhoanResponse',21:'TaiKhoanResponse'}
for i,(uc,module,method,reads,writes) in enumerate(MAPPING,1):
 for suffix in ['Controller','Service']:
  line=next(x for x in cl[module+suffix].splitlines() if x.startswith('+ '+method+'('))
  assert line.endswith(': '+expected[i]),(uc,line)
 for s in [reads,writes]:
  for name in s.split(', '):
   name=name.split(' (')[0]
   assert name=='—' or name in tables,(uc,name)
assert 'req: SuaTinRequest, photos: List<UploadFile>' in cl['TinDangController']
assert 'page: int, size: int): Page<YeuThichResponse>' in cl['YeuThichController']
arch=Document(ROOT/'Architecture/SYSTEM_ARCHITECTURE.docx')
assert len(arch.inline_shapes)==3
for phrase in ['10 Công nghệ','11 Quyết định','12 Yêu cầu','13 Đối chiếu','14 Câu hỏi']:
 assert any(p.text.startswith(phrase) for p in arch.paragraphs),phrase
result={'date':'2026-10-14','uc_rows':21,'controller_service_operations_checked':42,'architecture_figures':3,'nfr_groups':len(NFR),'defense_questions':len(QA),'class_copies_identical':True,'class_full_signatures_match':True,'sql_table_references_valid':True,'runtime_tests_executed':False,'scope':'21 main UC; auxiliary endpoints and Sequence messages not exhaustively verified'}
(ROOT/'Bao-cao-dong-bo/Kiem-tra-2026-10-14/architecture-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(result,ensure_ascii=False))
