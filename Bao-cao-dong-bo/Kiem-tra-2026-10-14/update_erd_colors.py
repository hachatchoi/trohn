from pathlib import Path
import xml.etree.ElementTree as E
import shutil, hashlib, json
from zipfile import ZipFile

base=Path('Database/ERD')
backup=Path('Bao-cao-dong-bo/Kiem-tra-2026-10-14/ERD-mau-backup')
backup.mkdir(exist_ok=True)
source=Path(r'C:\Users\00012\Downloads\TROHN_ERD_ChanChim.drawio')
src=E.parse(source)
def style(c):
    return dict(x.split('=',1) for x in c.get('style','').split(';') if '=' in x)
colors={c.get('parent'):style(c) for c in src.iter('mxCell') if style(c).get('fillColor')=='#dae8fc'}
assert len(colors)==12
old_images={}
S='http://www.w3.org/2000/svg'
E.register_namespace('',S)
for stem in ['TROHN_ERD_ChanChim']+[f'ChanChim_ChiTiet_{i}' for i in range(1,5)]:
    for ext in ['drawio','svg','png']:
        shutil.copy2(base/f'{stem}.{ext}',backup/f'{stem}.{ext}')
    old_images[hashlib.sha256((base/f'{stem}.png').read_bytes()).hexdigest()]=stem
    tree=E.parse(source if stem=='TROHN_ERD_ChanChim' else base/f'{stem}.drawio')
    root=tree.find('.//root'); cells=list(root.findall('mxCell')); ids={c.get('id'):c for c in cells}
    separators=[]; headers=[]
    for c in cells:
        parent=c.get('parent'); g=c.find('mxGeometry')
        if parent not in colors or g is None:continue
        pg=ids[parent].find('mxGeometry'); x=float(pg.get('x','0')); y=float(pg.get('y','0')); w=float(pg.get('width'))
        if c.get('value')==parent:
            st=style(c);st.update({k:colors[parent][k] for k in ['fillColor','strokeColor']})
            c.set('style',';'.join(f'{k}={v}' for k,v in st.items())+';')
            headers.append((parent,x,y,w,float(g.get('height')),st))
        if c.get('value') in ['PK','PK/FK']:
            bottom=round(float(g.get('y','0'))/20)*20+float(g.get('height'))
            line=E.SubElement(root,'mxCell',{'id':'pk_separator_'+c.get('id'),'parent':parent,'vertex':'1','value':'','style':'shape=line;strokeColor=#17212B;strokeWidth=2;fillColor=none;'})
            E.SubElement(line,'mxGeometry',{'x':'0','y':str(bottom),'width':str(w),'height':'0','as':'geometry'})
            separators.append((x,y+bottom,w))
    tree.write(base/f'{stem}.drawio',encoding='utf-8',xml_declaration=True)
    sv=E.parse(base/f'{stem}.svg'); sr=sv.getroot()
    for name,x,y,w,h,st in headers:
        title=next(c for c in sr if c.tag==f'{{{S}}}text' and c.text==name)
        idx=list(sr).index(title)
        sr.insert(idx,E.Element(f'{{{S}}}rect',{'x':str(x),'y':str(y),'width':str(w),'height':str(h),'fill':st['fillColor'],'stroke':st['strokeColor'],'stroke-width':'2'}))
        title.set('x',str(x+w/2));title.set('text-anchor','middle')
    for x,y,w in separators:
        E.SubElement(sr,f'{{{S}}}line',{'x1':str(x),'y1':str(y),'x2':str(x+w),'y2':str(y),'stroke':'#17212B','stroke-width':'2'})
    sv.write(base/f'{stem}.svg',encoding='utf-8',xml_declaration=True)
    print(stem,len(headers),'tables',len(separators),'PK rows')
shutil.copy2(base/'TROHN_ERD.drawio',backup/'TROHN_ERD.drawio')
shutil.copy2(base/'TROHN_ERD_ChanChim.drawio',base/'TROHN_ERD.drawio')
(backup/'old_image_hashes.json').write_text(json.dumps(old_images))
