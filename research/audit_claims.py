"""Rebuild the 1910 dossier audit from saved Horizons responses.

Requires numpy/scipy for interpolation. All event times are model results,
not historical observations. Observer ephemerides include light-time.
"""
from pathlib import Path
import csv, json, math
from datetime import datetime, timedelta
import numpy as np
from scipy.interpolate import CubicSpline
from scipy.optimize import brentq, minimize_scalar

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'research/raw'
LMT = 28.9784 * 240

def rows(name):
    text = (RAW / (name + '.txt')).read_text()
    return [[v.strip() for v in row] for row in csv.reader(text.split('$$SOE')[1].split('$$EOE')[0].strip().splitlines())]

def day(value):
    value=value.strip()
    return datetime.strptime(value, '%Y-%b-%d %H:%M:%S.%f' if '.' in value else '%Y-%b-%d %H:%M')

annual = []
for r in rows('audit_annual'):
    annual.append(dict(date=day(r[0]).strftime('%Y-%m-%d'), ra_deg=float(r[6]), dec_deg=float(r[7]),
        r_au=float(r[10]), delta_au=float(r[12]), elong_deg=float(r[14]), phase_deg=float(r[16]), constellation=r[17]))

windows = []
for c, s in zip(rows('audit_windows'), rows('audit_window_sun')):
    ut = day(c[0])
    windows.append(dict(date=ut.strftime('%Y-%m-%d'), supplied_utc2=(ut+timedelta(hours=2)).strftime('%H:%M'),
        ut=ut.strftime('%H:%M'), alt_deg=float(c[7]), az_deg=float(c[6]), sun_alt_deg=float(s[7]),
        meets_sun_below_minus10=float(s[7]) < -10))

comet, sun = rows('audit_transit_halley'), rows('audit_transit_sun')
epoch = day(comet[0][0]); points = []
for c, s in zip(comet, sun):
    ra, dec, sr, sd = np.radians([float(c[4]),float(c[5]),float(s[4]),float(s[5])])
    east = math.cos(dec)*math.sin(ra-sr)
    north = math.cos(sd)*math.sin(dec)-math.sin(sd)*math.cos(dec)*math.cos(ra-sr)
    dot = math.sin(sd)*math.sin(dec)+math.cos(sd)*math.cos(dec)*math.cos(ra-sr)
    sep = math.degrees(math.atan2(math.hypot(east,north),dot))
    # Gnomonic coordinates; scale preserves the Sun's angular radius to <0.01%.
    dx,dy = np.degrees([east/dot,north/dot])*60
    points.append(dict(seconds=(day(c[0])-epoch).total_seconds(), east_arcmin=float(dx),
        north_arcmin=float(dy), separation_deg=sep, solar_radius_deg=float(s[8])/7200,
        sun_alt_deg=float(s[7])))
times = [p['seconds'] for p in points]
splines = {k:CubicSpline(times,[p[k] for p in points]) for k in points[0] if k!='seconds'}
closest = minimize_scalar(splines['separation_deg'], bounds=(0,times[-1]), method='bounded').x
edge = lambda t:float(splines['separation_deg'](t)-splines['solar_radius_deg'](t))
contacts = [brentq(edge,0,closest),closest,brentq(edge,closest,times[-1])]
events = []
for label,t in zip(['ingress','closest','egress'],contacts):
    ut=epoch+timedelta(seconds=t)
    events.append(dict(kind=label,ut=ut.isoformat(),lmt=(ut+timedelta(seconds=LMT)).isoformat(),
        seconds=t,separation_deg=float(splines['separation_deg'](t)),sun_alt_deg=float(splines['sun_alt_deg'](t))))

result = dict(checked='2026-10-08', observer=dict(latitude=41.0082,longitude=28.9784,elevation_m=30),
    orbit=dict(solution='SAO/1910',record='90000029',frame='J2000 heliocentric ecliptic',
        epoch_jd_tdb=2418800.5,perihelion_jd_tdb=2418781.6785,q_au=.587208,e=.967302,i_deg=162.2186,
        node_deg=58.5629,argument_deg=111.7371),
    clocks=dict(lmt_offset_seconds=LMT,iana_imt_offset_seconds=7016,utc2_offset_seconds=7200),
    closest_earth=json.loads((ROOT/'research/validation.json').read_text()),
    annual=dict(epoch='00:00 UT',center='geocentric',coordinates='apparent RA/Dec, equinox of date',rows=annual),
    supplied_windows=windows,
    transit=dict(epoch_ut=epoch.isoformat(),sample_seconds=60,method='Apparent topocentric center separation; 1-minute Horizons samples, cubic interpolation; comet center treated as a point; no refraction',
        events=events,points=points))
(ROOT/'data/verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(ROOT/'verification-data.js').write_text('window.HALLEY_VERIFICATION='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
print(json.dumps(events,indent=2))
