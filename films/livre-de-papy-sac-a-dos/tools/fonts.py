"""Patrick Hand (OFL) for the handwritten lines: the latin and latin-ext slices from Google Fonts. usage: python -I tools/fonts.py <film dir>"""
import sys, os, re, urllib.request
D = sys.argv[1]; os.makedirs(os.path.join(D, 'fonts'), exist_ok=True)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60).read()
css = get('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=block').decode()
out = []
for i, (rng, url) in enumerate(re.findall(r'unicode-range: ([^;]+);.*?', css) and zip(re.findall(r'unicode-range: ([^;]+);', css), re.findall(r'url\((https://[^)]+)\)', css))):
    f = f'PatrickHand-{i}.woff2'; open(os.path.join(D, 'fonts', f), 'wb').write(get(url))
    out.append(f"@font-face{{font-family:'Patrick Hand';src:url({f}) format('woff2');font-weight:400;font-display:block;unicode-range:{rng}}}")
open(os.path.join(D, 'fonts', 'fonts.css'), 'w').write('\n'.join(out) + '\n'); print(len(out), 'font slices')
open(os.path.join(D, 'fonts', 'OFL-patrickhand.txt'), 'wb').write(get('https://raw.githubusercontent.com/google/fonts/main/ofl/patrickhand/OFL.txt'))
