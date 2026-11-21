"""Download the presentation font once; the running UI uses only local assets."""
from pathlib import Path
import re
import urllib.request

root = Path(__file__).resolve().parents[1]
directory = root / 'public' / 'fonts'
directory.mkdir(exist_ok=True)
source = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap'
request = urllib.request.Request(source, headers={'User-Agent': 'Mozilla/5.0'})
css = urllib.request.urlopen(request).read().decode()
for index, url in enumerate(dict.fromkeys(re.findall(r'url\((https://[^)]+)\)', css))):
    extension = '.woff2' if '.woff2' in url else '.ttf'
    filename = f'be-vietnam-pro-{index}{extension}'
    urllib.request.urlretrieve(url, directory / filename)
    css = css.replace(url, '/fonts/' + filename)
(root / 'src' / 'styles' / 'fonts.css').write_text(css, encoding='utf-8')
styles = root / 'src' / 'styles' / 'index.css'
text = styles.read_text(encoding='utf-8')
text = text.replace("@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');", "@import './fonts.css';")
styles.write_text(text, encoding='utf-8')
urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/OFL.txt', directory / 'OFL.txt')
print('Font assets are local; no runtime Google Fonts requests.')
