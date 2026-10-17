"""19 Mayıs 1910 İstanbul Güneş diski geçişi: data/transit.js dosyasının TEK üreticisi.

Kullanım (proje kökünde):  python3 tools/build_transit.py
Girdi: research/raw/audit_transit_halley.txt ve audit_transit_sun.txt (Horizons, 1 dk, İstanbul 41.0082 K 28.9784 D 30 m,
havasız, görünür topo-merkezli RA/Dec, tarihin gerçek ekvatoru). Gereken: Python 3, NumPy, SciPy.
Yöntem: merkezler arası küresel açı; kübik eğriyle giriş/çıkış (açı = Güneş yarıçapı) ve en küçük açı anı.
Halley merkezi nokta sayılır; kırılma yok. Güneş yarıçapı Horizons 'Ang-diam' alanının yarısıdır.
LMT = UT + 1 sa 55 dk 54,816 sn (28,9784° D). Ham dosyalardaki UT, 1910 için Horizons'un UT'sidir (UT1, UTC değil)."""
import json, re, datetime as dt, pathlib
import numpy as np
from scipy.interpolate import CubicSpline
from scipy.optimize import brentq, minimize_scalar

ROOT = pathlib.Path(__file__).resolve().parents[1]
LMT = dt.timedelta(seconds=6954.816)

def table(name):
    txt = (ROOT / 'research/raw' / name).read_text()
    rows = []
    for line in txt.split('$$SOE')[1].split('$$EOE')[0].strip().splitlines():
        c = [s.strip() for s in line.split(',')]
        t = dt.datetime.strptime(c[0], '%Y-%b-%d %H:%M')
        rows.append((t, float(c[4]), float(c[5]), float(c[6]), float(c[7]), float(c[8])))
    return rows

H, S = table('audit_transit_halley.txt'), table('audit_transit_sun.txt')
assert [r[0] for r in H] == [r[0] for r in S], 'zaman ızgaraları aynı olmalı'
t0 = H[0][0]
sec = np.array([(r[0] - t0).total_seconds() for r in H])
def vec(ra, de):
    ra, de = np.radians(ra), np.radians(de)
    return np.array([np.cos(de) * np.cos(ra), np.cos(de) * np.sin(ra), np.sin(de)]).T
hv, sv = vec(np.array([r[1] for r in H]), np.array([r[2] for r in H])), vec(np.array([r[1] for r in S]), np.array([r[2] for r in S]))
sepd = np.degrees(np.arccos(np.clip((hv * sv).sum(1), -1, 1)))
rad = np.array([r[5] for r in S]) / 3600 / 2                       # Ang-diam (″) → yarıçap (°)
sunalt = np.array([r[4] for r in S])
# teğet düzlem: Güneş merkezine göre doğu/kuzey (yay dakikası)
sra, sde = np.radians([r[1] for r in S]), np.radians([r[2] for r in S])
E = np.array([-np.sin(sra), np.cos(sra), np.zeros_like(sra)]).T
N = np.array([-np.sin(sde) * np.cos(sra), -np.sin(sde) * np.sin(sra), np.cos(sde)]).T
east = np.degrees(np.arctan2((hv * E).sum(1), (hv * sv).sum(1))) * 60
north = np.degrees(np.arctan2((hv * N).sum(1), (hv * sv).sum(1))) * 60

fsep, frad, falt = CubicSpline(sec, sepd), CubicSpline(sec, rad), CubicSpline(sec, sunalt)
g = lambda x: fsep(x) - frad(x)
i = int(np.argmin(sepd))
ing = brentq(g, sec[0], sec[i]); egr = brentq(g, sec[i], sec[-1])
clo = minimize_scalar(fsep, bounds=(sec[max(0, i - 3)], sec[min(len(sec) - 1, i + 3)]), method='bounded', options={'xatol': 1e-4}).x
def ev(kind, x):
    ut = t0 + dt.timedelta(seconds=float(x))
    return {'kind': kind, 'ut': ut.isoformat(), 'lmt': (ut + LMT).isoformat(), 'seconds': float(x), 'separation_deg': float(fsep(x)), 'sun_alt_deg': float(falt(x))}
out = {'epoch_ut': t0.isoformat(), 'sample_seconds': 60,
       'method': 'Apparent topocentric center separation; 1-minute Horizons samples, cubic interpolation; comet center treated as a point; no refraction',
       'events': [ev('ingress', ing), ev('closest', clo), ev('egress', egr)],
       'points': [{'seconds': float(s), 'east_arcmin': float(e), 'north_arcmin': float(n), 'separation_deg': float(d), 'solar_radius_deg': float(r), 'sun_alt_deg': float(a)}
                  for s, e, n, d, r, a in zip(sec, east, north, sepd, rad, sunalt)]}
(ROOT / 'data/transit.js').write_text('/* NASA/JPL Horizons, 19 Mayıs 1910 İstanbul geçiş hesabı — üretici: tools/build_transit.py */\nwindow.TRANSIT=' + json.dumps(out, ensure_ascii=False) + ';\n')
for e in out['events']: print(e['kind'], e['ut'], 'LMT', e['lmt'][11:19], 'Güneş', round(e['sun_alt_deg'], 3), 'ayrım', round(e['separation_deg'], 7))
