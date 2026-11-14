"""Bygger sidan: lägger in minifierad CSS direkt i index.html och minifierar JS.

Kör efter ändringar i css/style.css eller js/main.js:
    python3 _bygg/bygg.py
Kräver esbuild (npm i esbuild). Mappar som börjar med _ publiceras inte av GitHub Pages.
"""
import hashlib, pathlib, re, subprocess, sys

ROT = pathlib.Path(__file__).resolve().parent.parent
ESBUILD = sys.argv[1] if len(sys.argv) > 1 else 'esbuild'

def mini(fil, typ):
    return subprocess.run([ESBUILD, str(fil), '--minify', '--loader:.css=css', '--target=es2017'] if typ == 'css'
                          else [ESBUILD, str(fil), '--minify', '--target=es2017'],
                          capture_output=True, text=True, check=True).stdout.strip()

css = mini(ROT / 'css/style.css', 'css')
js = mini(ROT / 'js/main.js', 'js')
(ROT / 'js/main.min.js').write_text(js + '\n')
ver = hashlib.sha1(js.encode()).hexdigest()[:8]

html = (ROT / 'index.html').read_text()
html = re.sub(r'<!--css-->.*?<!--/css-->', lambda m: '<!--css--><style>' + css + '</style><!--/css-->', html, flags=re.S)
html = re.sub(r'<script src="js/main(\.min)?\.js[^"]*" defer></script>', f'<script src="js/main.min.js?v={ver}" defer></script>', html)
(ROT / 'index.html').write_text(html)
print(f'CSS {len(css)} tecken inlagd, JS {len(js)} tecken, version {ver}')
