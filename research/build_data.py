import contextlib,io
with contextlib.redirect_stdout(io.StringIO()):import analyze as a
import json,numpy as np,datetime as dt,pathlib
p=pathlib.Path(__file__).parent
start=dt.datetime(1910,4,20);end=dt.datetime(1910,6,10)
dates=[(start+dt.timedelta(days=i)).strftime('%Y-%m-%d') for i in range((end-start).days+1)]
allrows=[];twilight=[]
for date in dates:
 d=(dt.datetime.fromisoformat(date)-a.EPOCH).days;ts=d+np.arange(144)/144-a.LMT/24
 vals=[]
 for t in ts:
  h=a.interp('halley',t);s=a.interp('sun',t);m=a.interp('moon',t)
  vals.append([round(h['az'],3),round(h['alt'],3),round(s['az'],3),round(s['alt'],3),round(m['az'],3),round(m['alt'],3),round(m['illum'],1),round(h['elong'],2),round(h['delta'],4)])
 allrows.append(vals)
 rr=a.roots(lambda t:a.F['sun']['alt'](t)+12,d-a.LMT/24,d+1-a.LMT/24)
 twilight.append([round(((x+a.LMT/24)%1)*144) for x in rr])
(p/'simulation_data.json').write_text(json.dumps({'dates':dates,'rows':allrows,'twilight':twilight},separators=(',',':')))
# Geocentric minimum, fit smooth Earth-comet distance, do not infer tail crossing.
import csv
from scipy.interpolate import CubicSpline
from scipy.optimize import minimize_scalar
s=(p/'raw/geocentric.txt').read_text();r=list(csv.reader(io.StringIO(s.split('$$SOE')[1].split('$$EOE')[0].strip())))
t=np.array([float(x[1]) for x in r]);dist=np.array([float(x[14]) for x in r]);f=CubicSpline(t-t[0],dist);sol=minimize_scalar(f,bounds=(1,3),method='bounded');stamp=dt.datetime(1910,5,18)+dt.timedelta(days=float(sol.x))
def readrows(name):
 text=(p/'raw'/f'{name}.txt').read_text()
 return [[v.strip() for v in row] for row in csv.reader(io.StringIO(text.split('$$SOE')[1].split('$$EOE')[0].strip()))]
ref={row[0]:row for row in readrows('halley')}
check=readrows('modern_check')
diff=np.array([[float(row[c])-float(ref[row[0]][c]) for c in [8,9,14]] for row in check])
maxdiff=np.max(np.abs(diff),axis=0)
out={'geocentric_closest_ut':str(stamp),'geocentric_closest_lmt':str(stamp+dt.timedelta(hours=a.LMT)),'distance_au':float(sol.fun),'distance_km':float(sol.fun*149597870.7),'crosscheck_max_az_deg':float(maxdiff[0]),'crosscheck_max_alt_deg':float(maxdiff[1]),'crosscheck_max_distance_au':float(maxdiff[2]),'crosscheck_samples':len(check)}
(p/'validation.json').write_text(json.dumps(out,indent=2));print(out)
