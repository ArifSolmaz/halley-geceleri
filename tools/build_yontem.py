"""docs/*.md belgelerini tek bir okunabilir sayfaya (yontem.html) dönüştürür. Kullanım: python3 tools/build_yontem.py"""
import markdown, pathlib, re, html
root = pathlib.Path(__file__).resolve().parent.parent
docs = [('01-hikaye.md', 'Hikâye'), ('03-mekan-kaynaklari.md', 'Mekân ve kaynaklar'), ('05-bilim.md', 'Bilim'), ('04-kamera-ses-plani.md', 'Kamera ve ses'), ('02-senaryo.md', 'Senaryo'), ('06-son-degerlendirme.md', 'Son değerlendirme')]
secs, nav = [], []
for fn, title in docs:
    md = (root / 'docs' / fn).read_text(encoding='utf-8')
    body = markdown.markdown(md, extensions=['tables', 'fenced_code'])
    def table_scroll(match):
        table = match.group(0)
        wide = ' wide-table' if table.split('</thead>')[0].count('<th>') >= 3 else ''
        return '<div class="table-scroll' + wide + '" tabindex="0" role="region" aria-label="Kaydırılabilir kaynak tablosu">' + table + '</div>' + ('<p class="table-hint">↔ Tabloyu yatay kaydırabilirsiniz.</p>' if wide else '')
    body = re.sub(r'<table>.*?</table>', table_scroll, body, flags=re.S)
    body = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', body)
    sid = fn.split('.')[0]
    nav.append(f'<a href="#{sid}">{title}</a>')
    secs.append(f'<section id="{sid}">{body}</section>')
page = f"""<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Yöntem ve kaynaklar — Halley Geceleri</title><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="css/style.css">
<style>
body{{height:auto;min-height:100%;overflow:auto;background:#080b10}} .doc{{max-width:880px;margin:0 auto;padding:40px 18px 90px}}
.doc section{{scroll-margin-top:84px}} .doc h1{{font:300 clamp(2.2rem,1.6rem + 3vw,3.6rem)/1.05 var(--display);color:var(--stone);margin:.2rem 0 1rem}}
.doc h2{{font:400 1.9rem/1.2 var(--display);color:var(--stone);margin:2.6rem 0 .8rem;border-top:1px solid var(--line);padding-top:1.6rem}}
.doc h1,.doc h2,.doc h3{{overflow-wrap:anywhere}} .doc h3{{font:400 .78rem/1.4 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin:1.8rem 0 .5rem}}
.doc p,.doc li{{color:var(--text-2);line-height:1.65}} .doc strong{{color:var(--text);font-weight:500}}
.table-scroll{{overflow-x:auto;margin:1rem 0;max-width:100%}} .table-scroll.wide-table table{{min-width:560px}} .table-hint{{display:none}}
@media(max-width:640px){{.table-hint{{display:block;font:400 .72rem/1.5 var(--mono);color:var(--muted)}}}}
.doc table{{border-collapse:collapse;width:100%;font-size:.88rem;margin:0;display:table}}
.doc th,.doc td{{border-bottom:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top}} .doc th{{font:400 .7rem var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}}
.doc blockquote{{margin:.6rem 0;padding:6px 14px;border-left:2px solid var(--dawn);color:var(--dawn-2);font-family:var(--mono);font-size:.8rem}}
.doc code{{font-family:var(--mono);font-size:.85em;color:var(--dawn-2)}}
.topnav{{position:sticky;top:0;z-index:3;background:rgba(8,11,16,.92);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);display:flex;gap:8px 16px;flex-wrap:nowrap;overflow-x:auto;white-space:nowrap;scrollbar-width:thin;padding:6px 18px;font:400 .72rem var(--mono);letter-spacing:.08em;text-transform:uppercase}}
.topnav a{{display:inline-flex;align-items:center;min-height:44px;flex:0 0 auto;color:var(--text-2);text-decoration:none}} .topnav a:hover{{color:var(--lamp-2)}} .topnav .home{{color:var(--lamp-2)}}
</style></head><body>
<nav class="topnav" aria-label="Bölümler"><a class="home" href="index.html">← Deneyime dön</a>{''.join(nav)}<a href="index.html#gok">Gökyüzü</a><a href="index.html#belgeler">Gazete masası</a></nav>
<main class="doc"><p class="kicker">Halley Geceleri — İstanbul, 1910</p><h1>Yöntem ve kaynaklar</h1>
<p>Bu sayfa deneyimin hikâyesini, sahne senaryosunu, mekân ve görüntü kaynaklarını, kamera ve ses planını, bilimsel sınırlarını ve her sahne için son değerlendirmeyi bir araya getirir. Kaynak dosyalar <code>docs/</code> klasöründedir.</p>
{''.join(secs)}
<h2>Kaynak dosyalar ve haklar</h2><p>Ayrıntılı künye ve lisanslar: <a href="CREDITS.md">CREDITS.md</a>, ham Horizons yanıtları: <code>research/raw/</code>.</p>
</main></body></html>"""
(root / 'yontem.html').write_text(page, encoding='utf-8')
print('yontem.html', len(page))
