from pathlib import Path
import pypdfium2 as pdf
from PIL import Image,ImageDraw
q=Path(__file__).parent/'api-qa';q.mkdir(exist_ok=True)
d=pdf.PdfDocument(q.parent/'api-qa.pdf');print('PAGES',len(d))
for i,page in enumerate(d):
 page.render(scale=1.3).to_pil().save(q/f'page-{i+1}.png')
 print(i+1,len(page.get_textpage().get_text_range()))
for start in range(0,len(d),4):
 im=Image.new('RGB',(1200,1600),'#ddd');dr=ImageDraw.Draw(im)
 for i in range(start,min(start+4,len(d))):
  page=Image.open(q/f'page-{i+1}.png');page.thumbnail((590,760));x=(i-start)%2*600;y=(i-start)//2*800;im.paste(page,(x,y+25));dr.text((x+10,y+5),str(i+1),fill='black')
 im.save(q/f'contact-{start//4+1}.png')
