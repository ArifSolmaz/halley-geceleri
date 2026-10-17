"""docs/*.md belgelerini tek bir okunabilir sayfaya (yontem.html) dönüştürür. Kullanım: python3 tools/build_yontem.py"""
import markdown, pathlib, re, html
root = pathlib.Path(__file__).resolve().parent.parent
docs = [('01-hikaye.md', 'Hikâye'), ('03-mekan-kaynaklari.md', 'Mekân ve kaynaklar'), ('05-bilim.md', 'Bilim'), ('04-kamera-ses-plani.md', 'Görsel anlatım'), ('02-senaryo.md', 'Senaryo'), ('06-son-degerlendirme.md', 'Son değerlendirme')]
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
<title>Yöntem ve kaynaklar — Halley Geceleri</title><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="css/documentary.css">
<style>
body{{height:auto;overflow:auto;background:var(--paper);color:var(--ink)}} .doc{{max-width:880px;margin:auto;padding:60px 28px 100px}}
.doc section{{scroll-margin-top:90px;margin-top:70px}}.doc h1{{font:400 clamp(38px,5vw,64px)/1.05 var(--display);margin:0 0 26px}}.doc h2{{font:400 36px/1.15 var(--display);margin:45px 0 20px;border-top:1px solid var(--line);padding-top:30px}}.doc h3{{font:400 26px/1.2 var(--display);margin:30px 0 15px}}.doc p,.doc li{{line-height:1.65;font-size:20px}}.doc h1,.doc h2,.doc h3,.doc a{{overflow-wrap:anywhere}}.doc strong{{font-weight:600}}.doc code{{font:400 .72em/1.7 var(--mono);overflow-wrap:anywhere}}.doc pre{{background:var(--paper-dark);padding:18px;overflow-x:auto}}.doc blockquote{{border-left:2px solid var(--rust);padding-left:20px;margin-inline:0;color:var(--muted)}}.kicker{{font:400 11px/1.6 var(--mono)!important;letter-spacing:.1em;color:var(--rust)}}
.table-scroll{{overflow-x:auto;max-width:100%;margin:25px 0}}.table-scroll.wide-table table{{min-width:620px}}.doc table{{border-collapse:collapse;width:100%;font-size:17px;line-height:1.5}}.doc th,.doc td{{border-bottom:1px solid var(--line);padding:12px 15px;text-align:left;vertical-align:top}}.doc th{{font:400 10px/1.6 var(--mono);color:var(--rust)}}.table-hint{{font:400 10px var(--mono)!important;color:var(--muted)}}
.topnav{{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:24px;overflow-x:auto;white-space:nowrap;padding:12px 28px;background:var(--paper);border-bottom:1px solid var(--line)}}.topnav a{{display:inline-flex;align-items:center;min-height:44px;flex:0 0 auto;font:400 10px var(--mono);text-decoration:none}}.topnav .home{{color:var(--rust)}}
@media(max-width:640px){{.doc{{padding:40px 20px 70px}}.doc section{{margin-top:50px}}.doc h1{{font-size:42px}}.doc h2{{font-size:32px}}.topnav{{padding:6px 20px;gap:20px}}}}
</style></head><body>
<nav class="topnav" aria-label="Bölümler"><a class="home" href="index.html">← 1910’a dön</a>{''.join(nav)}<a href="index.html#gok">Gökyüzü</a><a href="index.html#belgeler">Kaynak odası</a></nav>
<main class="doc"><p class="kicker">Halley Geceleri — İstanbul, 1910</p><h1>Yöntem ve kaynaklar</h1>
<p>Bu sayfa tarihsel yeniden canlandırmanın senaryosunu, görsel dilini, mekân kaynaklarını ve bilimsel hesaplarının sınırlarını bir araya getirir. Mekân kaynaklarının tarihleri ve yeniden canlandırmada nasıl kullanıldıkları ayrıca açıklanır. Kaynak dosyalar <code>docs/</code> klasöründedir.</p>
{''.join(secs)}
<h2>Kaynak dosyalar ve haklar</h2><p>Ayrıntılı künye ve lisanslar: <a href="CREDITS.md">CREDITS.md</a>, ham Horizons yanıtları: <code>research/raw/</code>.</p>
</main></body></html>"""
(root / 'yontem.html').write_text(page, encoding='utf-8')
print('yontem.html', len(page))
