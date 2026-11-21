from pathlib import Path
from html import escape
import xml.etree.ElementTree as E
from architecture_data import ROOT

OUT=ROOT/'Architecture/So-do';OUT.mkdir(exist_ok=True)
def diagram(stem,title,boxes,edges,notes,height):
    width=1400
    xml=E.Element('mxfile',{'host':'app.diagrams.net','type':'device'})
    dg=E.SubElement(xml,'diagram',{'name':title}); model=E.SubElement(dg,'mxGraphModel',{'page':'1','pageWidth':str(width),'pageHeight':str(height)})
    root=E.SubElement(model,'root');E.SubElement(root,'mxCell',{'id':'0'});E.SubElement(root,'mxCell',{'id':'1','parent':'0'})
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">', '<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="#42566b" stroke-width="1.5"/></marker></defs>','<rect width="100%" height="100%" fill="white"/>']
    def text(x,y,lines,size=23,anchor='middle',bold=False):
        for i,l in enumerate(lines):svg.append(f'<text x="{x}" y="{y+i*(size+8)}" text-anchor="{anchor}" font-family="Arial" font-size="{size}" font-weight="{700 if bold else 400}" fill="#17212b">{escape(l)}</text>')
    text(40,45,[title],29,'start',True)
    titlec=E.SubElement(root,'mxCell',{'id':'title','parent':'1','vertex':'1','value':title,'style':'text;html=0;fontSize=29;fontStyle=1;align=left;'})
    E.SubElement(titlec,'mxGeometry',{'x':'40','y':'10','width':'1320','height':'50','as':'geometry'})
    for k,(bid,x,y,w,h,label,color) in enumerate(boxes):
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{color}" stroke="#637e99" stroke-width="2"/>')
        lines=label.split('\n');text(x+w/2,y+h/2-(len(lines)-1)*15+8,lines)
        c=E.SubElement(root,'mxCell',{'id':bid,'parent':'1','vertex':'1','value':label,'style':f'rounded=1;whiteSpace=wrap;html=0;fillColor={color};strokeColor=#637e99;fontFamily=Arial;fontSize=23;align=center;verticalAlign=middle;'})
        E.SubElement(c,'mxGeometry',{'x':str(x),'y':str(y),'width':str(w),'height':str(h),'as':'geometry'})
    for i,(source,target,points,label,lx,ly) in enumerate(edges):
        svg.append(f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" stroke="#42566b" stroke-width="2.2" marker-end="url(#arrow)"/>')
        if label:text(lx,ly,[label],19)
        c=E.SubElement(root,'mxCell',{'id':f'e{i}','parent':'1','edge':'1','value':label,'source':source,'target':target,'style':'edgeStyle=orthogonalEdgeStyle;rounded=0;endArrow=open;strokeColor=#42566b;fontSize=19;labelBackgroundColor=#FFFFFF;'})
        g=E.SubElement(c,'mxGeometry',{'relative':'1','as':'geometry'});ar=E.SubElement(g,'Array',{'as':'points'})
        for x,y in points[1:-1]:E.SubElement(ar,'mxPoint',{'x':str(x),'y':str(y)})
    for i,(x,y,n) in enumerate(notes):
        text(x,y,n.split('\n'),20,'start')
        c=E.SubElement(root,'mxCell',{'id':f'n{i}','parent':'1','vertex':'1','value':n,'style':'text;html=0;fontSize=20;align=left;verticalAlign=top;'})
        E.SubElement(c,'mxGeometry',{'x':str(x),'y':str(y-23),'width':'1300','height':str(30*len(n.split('\n'))),'as':'geometry'})
    svg.append('</svg>');(OUT/f'{stem}.svg').write_text('\n'.join(svg),encoding='utf-8');E.ElementTree(xml).write(OUT/f'{stem}.drawio',encoding='utf-8',xml_declaration=True)

diagram('Kien_truc_tong_the','TROHN — Kiến trúc tổng thể đề xuất',[
('roles',350,90,700,70,'Khách thuê  |  Chủ trọ  |  Quản trị viên','#eef2f6'),
('ui',350,210,700,95,'Trình duyệt: React + TypeScript\nForm, danh sách, bản đồ Leaflet','#dae8fc'),
('sec',350,365,700,100,'Spring Security\nPhiên MySQL · vai trò · Origin / CSRF','#f8cecc'),
('ctrl',350,520,700,80,'Controller: HTTP và Request / Response DTO','#e1d5e7'),
('svc',350,660,700,110,'Service: nghiệp vụ và quyền sở hữu\nRanh giới transaction cho thao tác nhiều bảng','#d5e8d4'),
('repo',350,840,700,85,'Repository / JPA: truy vấn, khóa và lưu dữ liệu','#fff2cc'),
('db',350,995,700,90,'MySQL / InnoDB\n12 bảng gồm dữ liệu nghiệp vụ và phiên','#dae8fc'),
('img',35,660,260,110,'ImageStorage\nẢnh ngoài web root','#fff2cc'),
('geo',1105,660,260,110,'GeoService\nKhoảng cách tới cơ sở','#fff2cc')],
[('roles','ui',[(700,160),(700,210)],'',0,0),('ui','sec',[(700,305),(700,365)],'HTTPS / JSON / multipart',700,343),('sec','ctrl',[(700,465),(700,520)],'ActorContext từ phiên hợp lệ',700,499),('ctrl','svc',[(700,600),(700,660)],'Gọi phương thức nghiệp vụ',700,637),('svc','repo',[(700,770),(700,840)],'Entity và truy vấn',700,812),('repo','db',[(700,925),(700,995)],'SQL / JDBC',700,967),('svc','img',[(350,715),(295,715)],'',0,0),('svc','geo',[(1050,715),(1105,715)],'',0,0)],
[(40,1140,'Các module: tài khoản / phiên, tin đăng, yêu thích, lịch hẹn, danh mục, quản trị.'),(40,1180,'Security tra phiên và tài khoản qua Repository; Service kiểm lại trước khi ghi.'),(40,1220,'ImageStorage không nằm trong transaction DB; GeoService tính tại backend, không phải API chỉ đường.'),(40,1260,'Giao diện đã có bản demo. Các thành phần backend trong hình là thiết kế cần triển khai.')],1300)

diagram('Trien_khai_local','TROHN — Môi trường phát triển và kiểm thử đề xuất',[
('ui',70,120,480,130,'Trình duyệt + Vite dev server\nhttp://127.0.0.1:5173\nGiao diện demo hiện có','#dae8fc'),
('api',800,120,520,130,'Spring Boot\nhttp://127.0.0.1:8080\nBackend cần triển khai','#d5e8d4'),
('db',800,410,520,115,'MySQL / InnoDB\n127.0.0.1:3306','#dae8fc'),
('files',70,410,480,115,'Vùng ảnh trên máy phát triển\nNằm ngoài web root','#fff2cc'),
('test',70,660,480,115,'Postman / công cụ kiểm thử\nCookie phiên + Origin + CSRF','#e1d5e7')],
[('ui','api',[(550,180),(800,180)],'HTTP /api/v1',675,159),('api','db',[(1060,250),(1060,410)],'JDBC',1100,335),('api','files',[(800,225),(650,225),(650,467),(550,467)],'File I/O',650,365),('test','api',[(550,717),(700,717),(700,280),(1060,280),(1060,250)],'',0,0)],
[(40,850,'Dùng thống nhất origin 127.0.0.1:5173; CORS allow đúng origin, gửi credentials.'),(40,890,'MySQL và phpMyAdmin có cấu hình Compose; chưa coi đó là backend hoặc kết quả SQL đã chạy.'),(40,930,'Chỉ kiểm thử Postman thật sau khi backend chạy và kết nối DB; không gửi request vào production.')],980)

diagram('Trien_khai_production','TROHN — Phương án triển khai production',[
('browser',420,100,560,80,'Người dùng trên trình duyệt','#dae8fc'),
('proxy',420,260,560,100,'Reverse proxy HTTPS\nTên miền và chứng chỉ cấu hình khi triển khai','#e1d5e7'),
('static',40,470,460,95,'Static build React\nĐường dẫn /','#dae8fc'),
('api',800,470,550,105,'Spring Boot\n/api → cổng backend nội bộ','#d5e8d4'),
('db',800,740,550,100,'MySQL trong mạng riêng\nKhông public cổng DB','#dae8fc'),
('files',40,740,460,100,'Volume ảnh bền vững\nKhông public thư mục trực tiếp','#fff2cc'),
('backup',420,1010,560,90,'Sao lưu DB + vùng ảnh\nKiểm tra khôi phục ở môi trường riêng','#eef2f6')],
[('browser','proxy',[(700,180),(700,260)],'HTTPS',755,225),('proxy','static',[(550,360),(270,360),(270,470)],'/',330,395),('proxy','api',[(850,360),(1075,360),(1075,470)],'/api',1140,410),('api','db',[(1075,575),(1075,740)],'JDBC nội bộ',1165,660),('api','files',[(800,525),(650,525),(650,790),(500,790)],'File I/O',650,683),('db','backup',[(1075,840),(1075,1055),(980,1055)],'',0,0),('files','backup',[(270,840),(270,1055),(420,1055)],'',0,0)],
[(40,1170,'Một origin cho frontend và API; cookie Secure, HttpOnly, SameSite=Lax; bí mật ở cấu hình môi trường.'),(40,1210,'Ảnh chỉ được đọc qua API kiểm quyền. Phương án một backend; chưa có CI/CD hoặc hosting đã xác nhận.')],1260)
print('3 SVG and 3 editable Draw.io diagrams created')
