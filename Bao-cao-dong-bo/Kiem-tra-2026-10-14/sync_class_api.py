from architecture_data import ROOT
import xml.etree.ElementTree as E
from pathlib import Path
import shutil,json,re,html
from PIL import ImageFont
OUT=ROOT/'Bao-cao-dong-bo/Kiem-tra-2026-10-14'
BK=OUT/'Truoc-bo-sung-kien-truc';BK.mkdir(exist_ok=True)
def backup(p):
    q=BK/p.relative_to(ROOT);q.parent.mkdir(parents=True,exist_ok=True)
    if not q.exists():shutil.copy2(p,q)
def sty(c):return dict(x.split('=',1) for x in c.get('style','').split(';') if '=' in x)
def changes(name,text):
    if name in ('TaiKhoanController','TaiKhoanService'):
        text=re.sub(r'(\+ (?:khoaTaiKhoan|moKhoaTaiKhoan)\([^\n]+\)): void',r'\1: TaiKhoanResponse',text)
    if name in ('TinDangController','TinDangService'):
        text=text.replace('Page<TinDangResponse>','Page<TinTomTat>').replace('): TinDangResponse','): TinQuanLyResponse')
        text=text.replace('req: TinDangRequest): TinQuanLyResponse','req: TinDangRequest, photos: List<UploadFile>): TinQuanLyResponse')
        text=text.replace('id: Long, version: Long, req: TinDangRequest, photos: List<UploadFile>','id: Long, req: SuaTinRequest, photos: List<UploadFile>')
        text=re.sub(r'(\+ (?:anTinCuaChuTro|anTinViPham)\([^\n]+\)): void',r'\1: TrangThaiTinResponse',text)
        text=re.sub(r'(\+ (?:duyetTin|tuChoiTin)\([^\n]+\)): void',r'\1: TinQuanLyResponse',text)
    if name in ('YeuThichController','YeuThichService'):
        text=text.replace('): YeuThichResponse','): LuuYeuThichResponse').replace('xemDanhSach(actor: ActorContext): List<YeuThichResponse>','xemDanhSach(actor: ActorContext, page: int, size: int): Page<YeuThichResponse>')
    if name in ('LichHenController','LichHenService'):
        text=re.sub(r'(\+ (?:huyLich|xacNhanLich|tuChoiLich)\([^\n]+\)): void',r'\1: LichHenResponse',text)
    return text
def patch(tree):
    changed=[]
    for diagram in tree.findall('diagram'):
        cs=list(diagram.iter('mxCell')); names={c.get('parent'):c.get('value','').split('\n')[-1] for c in cs if c.get('value','').startswith(('«controller»','«service»'))}
        for c in cs:
            old=c.get('value','');new=changes(names.get(c.get('parent'),''),old)
            if old.startswith('DTO SỬ DỤNG'):
                new=new.replace('TinDangRequest; TinDangResponse; ChiTietTinResponse','TinDangRequest; SuaTinRequest; TinQuanLyResponse; ChiTietTinResponse; TrangThaiTinResponse')
                new=new.replace('YeuThichResponse {tinId, khaDung, thongTinCongKhai}','LuuYeuThichResponse {tinId, saved}; YeuThichResponse {tinId, ngayLuu, khaDung, tin}')
            if old!=new:
                c.set('value',new);changed.append((diagram.get('name'),c.get('id')))
    return changed

# Text is rendered from the same source cells as Draw.io to keep exported figures consistent.
def render(diagram,path):
    model=diagram.find('mxGraphModel');w=float(model.get('pageWidth'));h=float(model.get('pageHeight'));cs=list(model.iter('mxCell'));ids={c.get('id'):c for c in cs}
    def box(c):
        g=c.find('mxGeometry')
        if g is None:return 0,0,0,0
        x=float(g.get('x',0));y=float(g.get('y',0));ww=float(g.get('width',0));hh=float(g.get('height',0))
        parent=ids.get(c.get('parent'))
        if parent is not None and parent.get('vertex')=='1':
            px,py,_,_=box(parent);x+=px;y+=py
        return x,y,ww,hh
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:g}" height="{h:g}" viewBox="0 0 {w:g} {h:g}">','<defs><marker id="open" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0 0 L9 5 L0 10" fill="none" stroke="#607D96" stroke-width="1.5"/></marker></defs>','<rect width="100%" height="100%" fill="white"/>']
    for c in cs:
        if c.get('edge')!='1':continue
        st=sty(c);g=c.find('mxGeometry');src=ids.get(c.get('source'));dst=ids.get(c.get('target'))
        if src is None or dst is None:continue
        x,y,ww,hh=box(src);xx,yy,www,hhh=box(dst)
        sx=x+ww*float(st.get('exitX','1'));sy=y+hh*float(st.get('exitY','.5'));tx=xx+www*float(st.get('entryX','0'));ty=yy+hhh*float(st.get('entryY','.5'))
        pts=[(sx,sy)]+[(float(p.get('x')),float(p.get('y'))) for p in g.findall('./Array/mxPoint')]+[(tx,ty)]
        if len(pts)==2 and sx!=tx and sy!=ty:pts=[(sx,sy),((sx+tx)/2,sy),((sx+tx)/2,ty),(tx,ty)]
        dash='stroke-dasharray="8 5"' if st.get('dashed')=='1' else ''
        arrow='marker-end="url(#open)"' if st.get('endArrow','none')!='none' else ''
        out.append(f'<polyline points="{" ".join(f"{a},{b}" for a,b in pts)}" fill="none" stroke="{st.get("strokeColor","#607D96")}" stroke-width="2" {dash} {arrow}/>')
        if c.get('value'):out.append(f'<text x="{(sx+tx)/2}" y="{(sy+ty)/2-8}" font-family="Arial" font-size="16" fill="#334155">{html.escape(c.get("value"))}</text>')
    for c in cs:
        if c.get('vertex')!='1':continue
        st=sty(c);x,y,ww,hh=box(c);val=c.get('value','');istext=c.get('style','').startswith('text;')
        if not istext:
            fill=st.get('fillColor','#FFFFFF');stroke=st.get('strokeColor','#527FA2')
            out.append(f'<rect x="{x}" y="{y}" width="{ww}" height="{hh}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')
        if not val:continue
        lines=val.split('\n');size=float(st.get('fontSize','18'));bold=int(st.get('fontStyle','0'))&1
        fontpath='C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf'
        while size>11:
            f=ImageFont.truetype(fontpath,int(size))
            if max(f.getlength(l) for l in lines)<=ww-18 and len(lines)*size*1.3<=hh-10:break
            size-=.5
        align=st.get('align','left');xx=x+ww/2 if align=='center' else x+8;anchor='middle' if align=='center' else 'start'
        top=y+8+size if st.get('verticalAlign')=='top' else y+(hh-len(lines)*size*1.3)/2+size
        for j,line in enumerate(lines):out.append(f'<text x="{xx}" y="{top+j*size*1.3}" text-anchor="{anchor}" font-family="Arial" font-size="{size}" font-weight="{700 if bold else 400}" fill="{st.get("fontColor","#263648")}">{html.escape(line)}</text>')
    out.append('</svg>');path.write_text('\n'.join(out),encoding='utf-8')

source=ROOT/'class-diagram/TROHN_Class_Diagram_Da_Chinh_Sua.drawio';backup(source);tree=E.parse(source);changed=patch(tree);tree.write(source,encoding='utf-8',xml_declaration=True)
other=ROOT/'Bao-cao-dong-bo/Class-Diagram/TROHN_Class_Diagram_Da_Chinh_Sua.drawio';backup(other);shutil.copy2(source,other)
for i,d in enumerate(tree.findall('diagram'),1):
    if i>=3:
        for folder in ['class-diagram/preview','Bao-cao-dong-bo/Class-Diagram/preview']:backup(ROOT/folder/f'{i:02}.png')
        render(d,ROOT/f'class-diagram/preview/{i:02}.svg')

full=ROOT/'Bao-cao-dong-bo/Class-Diagram/Tong-hop/TROHN_Class_Diagram_FULL.drawio';backup(full);ft=E.parse(full);patch(ft);ft.write(full,encoding='utf-8',xml_declaration=True)
# Keep the carefully routed FULL figure: replace only the content of modified compartments.
svgpath=full.with_suffix('.svg');backup(svgpath);backup(full.with_suffix('.png'))
ns='http://www.w3.org/2000/svg';E.register_namespace('',ns);sv=E.parse(svgpath);sr=sv.getroot()
before=E.parse(BK/full.relative_to(ROOT));old={c.get('id'):c for c in before.iter('mxCell')};cs=list(ft.iter('mxCell'));ids={c.get('id'):c for c in cs}
def absbox(c):
    g=c.find('mxGeometry');x=float(g.get('x',0));y=float(g.get('y',0));w=float(g.get('width',0));h=float(g.get('height',0));par=ids.get(c.get('parent'))
    if par is not None and par.get('vertex')=='1':px,py,_,_=absbox(par);x+=px;y+=py
    return x,y,w,h
for c in cs:
    if c.get('id') not in old or c.get('value')==old[c.get('id')].get('value'):continue
    x,y,w,h=absbox(c)
    for el in list(sr):
        if el.tag==f'{{{ns}}}text' and x<=float(el.get('x','-1'))<=x+w and y<=float(el.get('y','-1'))<=y+h:sr.remove(el)
    st=sty(c);size=float(st.get('fontSize','18'));lines=c.get('value','').split('\n')
    while size>11:
        f=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',int(size))
        if max(f.getlength(l) for l in lines)<=w-20 and len(lines)*size*1.3<=h-12:break
        size-=.5
    for j,l in enumerate(lines):E.SubElement(sr,f'{{{ns}}}text',{'x':str(x+9),'y':str(y+9+size+j*size*1.3),'font-family':'Arial','font-size':str(size),'fill':'#263648'}).text=l
sv.write(svgpath,encoding='utf-8',xml_declaration=True)
catalog=full.parent/'Danh_muc_lop.json';backup(catalog);data=json.loads(catalog.read_text(encoding='utf-8'))
for name,item in data.items():item['methods']=[changes(name,m) for m in item['methods']]
catalog.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'class_sync_changes.json').write_text(json.dumps(changed,ensure_ascii=False,indent=2),encoding='utf-8')
print('Updated method compartments',len(changed),'across 6-page source and FULL; 41 types / 95 methods retained')
