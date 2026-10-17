import csv,io,json,pathlib,datetime as dt,numpy as np
from scipy.interpolate import CubicSpline
from scipy.optimize import brentq,minimize_scalar
P=pathlib.Path(__file__).parent
D={}
for body in ['halley','sun','moon']:
 text=(P/'raw'/f'{body}.txt').read_text(); rows=list(csv.reader(io.StringIO(text.split('$$SOE')[1].split('$$EOE')[0].strip())))
 rows=[[v.strip() for v in row] for row in rows]
 d={'t':np.array([(dt.datetime.strptime(r[0],'%Y-%b-%d %H:%M')-dt.datetime(1910,4,1)).total_seconds()/86400 for r in rows])}
 cols={'halley':{'ra':6,'dec':7,'az':8,'alt':9,'mag_model':10,'r':12,'delta':14,'elong':16,'phase':18,'pa':19},'sun':{'ra':4,'dec':5,'az':6,'alt':7},'moon':{'ra':4,'dec':5,'az':6,'alt':7,'illum':8}}[body]
 for k,i in cols.items():d[k]=np.array([float(r[i]) for r in rows])
 D[body]=d
T=D['halley']['t']; F={b:{k:CubicSpline(T,np.unwrap(np.radians(v))*180/np.pi if k in ['ra','az','pa'] else v) for k,v in d.items() if k!='t'} for b,d in D.items()}
LMT=28.9784/15 # derived mean solar time, not an assertion about every civil clock
EPOCH=dt.datetime(1910,4,1)
def time(t,offset=0):return (EPOCH+dt.timedelta(days=float(t),hours=offset,seconds=30)).strftime('%Y-%m-%d %H:%M')
def roots(fn,a,b):
 ts=np.linspace(a,b,289);ys=fn(ts);return [brentq(fn,ts[i],ts[i+1]) for i in range(len(ts)-1) if ys[i]*ys[i+1]<0]
def interp(body,t):return {k:float(f(t)%360 if k in ['ra','az','pa'] else f(t)) for k,f in F[body].items()}
print('LMT offset',LMT)
rows=[]
for date in ['1910-04-20','1910-05-01','1910-05-10','1910-05-15','1910-05-18','1910-05-19','1910-05-20','1910-05-21','1910-05-25','1910-05-31','1910-06-10']:
 d=(dt.datetime.fromisoformat(date)-EPOCH).days
 for am in [True,False]:
  a=d-LMT/24+(0 if am else .5);b=a+.5
  tw=roots(lambda t:F['sun']['alt'](t)+12,a,b)[0]
  h=interp('halley',tw);m=interp('moon',tw)
  row=dict(date=date,period='sabah' if am else 'aksam',ut=time(tw),lmt=time(tw,LMT),utc3=time(tw,3),**h,moon_alt=m['alt'],moon_illum=m['illum'])
  rows.append(row)
  print(date,row['period'],row['lmt'][-5:],f"h={h['alt']:.2f} az={h['az']:.2f} elong={h['elong']:.2f} dist={h['delta']:.4f}",f"moon {m['alt']:.1f}/{m['illum']:.0f}%")
(P/'summary.json').write_text(json.dumps(rows,indent=2))
with (P/'summary.csv').open('w') as f:w=csv.DictWriter(f,rows[0].keys());w.writeheader();w.writerows(rows)
for key in ['delta','elong','r']:
 idx=np.argmin(D['halley'][key]);a=T[max(idx-2,0)];b=T[min(idx+2,len(T)-1)]
 sol=minimize_scalar(F['halley'][key],bounds=(a,b),method='bounded');print('MIN',key,time(sol.x),time(sol.x,LMT),sol.fun,interp('halley',sol.x))
for date in ['1910-05-10','1910-05-15','1910-05-18','1910-05-19','1910-05-20','1910-05-21','1910-05-25']:
 d=(dt.datetime.fromisoformat(date)-EPOCH).days;a=d-LMT/24;b=a+1
 print('EVENTS',date)
 for body,limit in [('halley',0),('sun',-.833),('sun',-12),('sun',-18)]:
  print(body,limit,[(time(r,LMT)[-5:],'rise' if F[body]['alt'].derivative()(r)>0 else 'set') for r in roots(lambda t:F[body]['alt'](t)-limit,a,b)])
# Full machine readable table.
with (P/'ephemeris_10min.csv').open('w') as f:
 names=['ut','lmt']+[b+'_'+k for b in D for k in D[b] if k!='t'];w=csv.writer(f);w.writerow(names)
 for i,t in enumerate(T):w.writerow([time(t),time(t,LMT)]+[f'{D[b][k][i]:.7f}' for b in D for k in D[b] if k!='t'])
