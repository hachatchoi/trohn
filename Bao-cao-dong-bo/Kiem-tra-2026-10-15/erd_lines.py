from pathlib import Path
import xml.etree.ElementTree as E,hashlib,shutil,math
from PIL import Image,ImageDraw,ImageFont
from docx import Document
R=Path('D:/Chuyên đề tổng hợp'); B=R/'Bao-cao-dong-bo/Kiem-tra-2026-10-15/ERD-before-lines';B.mkdir(exist_ok=True)
base=R/'Database/ERD'; images={}
note='Nét liền: FK thuộc PK bảng con. Nét đứt: FK không thuộc PK bảng con.'
for stem in ['TROHN_ERD_ChanChim']+[f'ChanChim_ChiTiet_{i}' for i in range(1,5)]:
 p=base/(stem+'.drawio');shutil.copy2(p,B/p.name);t=E.parse(p);root=t.find('.//root')
 edges=[c for c in t.iter('mxCell') if c.get('data-fk')]
 # The existing raster exports use these explicit SVG connector paths.
 sv=E.parse(R/f'Bao-cao-dong-bo/Kiem-tra-2026-10-14/ERD-mau-backup/{stem}.svg')
 paths=[c for c in sv.getroot() if c.tag.endswith('polyline') and c.get('stroke-width')=='2' and len(c.get('points').split())>2]
 assert len(paths)==len(edges),(stem,len(paths),len(edges))
 png=p.with_suffix('.png');shutil.copy2(png,B/png.name);old=hashlib.sha256(png.read_bytes()).hexdigest();im=Image.open(png).convert('RGB');draw=ImageDraw.Draw(im)
 solid=0
 for c,path in zip(edges,paths):
  identifying=c.get('data-fk').startswith('TinDang_TienIch.')
  c.set('style',c.get('style','')+('dashed=0;' if identifying else 'dashed=1;dashPattern=8 5;'))
  if identifying:solid+=1;continue
  pts=[tuple(map(float,s.split(','))) for s in path.get('points').split()]
  # Preserve endpoint symbols. Only remove alternating portions of connector strokes.
  for j,(a,b) in enumerate(zip(pts,pts[1:])):
   length=math.dist(a,b);ux=(b[0]-a[0])/length if length else 0;uy=(b[1]-a[1])/length if length else 0
   lo=48 if j==0 else 6; hi=length-(48 if j==len(pts)-2 else 6)
   for start in range(int(lo)+16,int(hi),26):
    end=min(start+9,hi)
    x1,y1=a[0]+ux*start,a[1]+uy*start;x2,y2=a[0]+ux*end,a[1]+uy*end
    draw.line((x1,y1,x2,y2),fill='white',width=3)
 c=E.SubElement(root,'mxCell',{'id':'relationship_line_legend','value':note,'vertex':'1','parent':'1','style':'text;html=0;fontSize=24;align=left;verticalAlign=top;'})
 E.SubElement(c,'mxGeometry',{'x':'80','y':'155','width':str(im.width-100),'height':'35','as':'geometry'})
 draw.text((80,155),note,font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',24),fill='#17212B')
 t.write(p,encoding='utf-8',xml_declaration=True);im.save(png);images[old]=png.read_bytes()
 print(stem,'solid',solid,'dashed',len(edges)-solid)
shutil.copy2(base/'TROHN_ERD.drawio',B/'TROHN_ERD.drawio');shutil.copy2(base/'TROHN_ERD_ChanChim.drawio',base/'TROHN_ERD.drawio')
p=R/'Database/THIET_KE_DATABASE_TROHN.docx';shutil.copy2(p,B/p.name);d=Document(p);count=0
for rel in d.part.rels.values():
 if 'image' in rel.reltype:
  h=hashlib.sha256(rel.target_part.blob).hexdigest()
  if h in images:rel.target_part._blob=images[h];count+=1
for para in d.paragraphs:
 if para.text.startswith('Hai vạch thể hiện'):
  para.add_run(' '+note+' Hai quan hệ từ TinDang và TienIch tới TinDang_TienIch là quan hệ định danh; các quan hệ còn lại là không định danh.')
assert count==5,count
d.save(p);print('Word images',count)

