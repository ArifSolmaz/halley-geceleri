"""Refresh the audit responses; URLs and parameters are preserved alongside them."""
import urllib.request,urllib.parse,pathlib,json,concurrent.futures,datetime as dt
p=pathlib.Path(__file__).resolve().parent/'raw';dates=['1910-01-01','1910-02-01','1910-03-01','1910-04-01','1910-04-15','1910-04-20','1910-05-01','1910-05-10','1910-05-15','1910-05-18','1910-05-19','1910-05-20','1910-05-22','1910-05-25','1910-05-30','1910-06-15','1910-07-01','1910-08-01','1910-12-01']
times=['19:45','18:15','19:00',None,'04:30','04:30','04:00','04:00','03:45',None,None,None,'20:30','20:30','20:30','20:45','20:45',None,None]
def jd(date):return (date-dt.datetime(2000,1,1,12)).total_seconds()/86400+2451545
jobs={}
params={'format':'text','EPHEM_TYPE':"'OBSERVER'",'COMMAND':"'90000029'",'CENTER':"'500@399'",'QUANTITIES':"'1,2,9,19,20,23,24,29'",'TLIST':"'"+' '.join(str(jd(dt.datetime.fromisoformat(d))) for d in dates)+"'",'TLIST_TYPE':"'JD'",'ANG_FORMAT':"'DEG'",'CSV_FORMAT':"'YES'",'EXTRA_PREC':"'YES'",'CAL_FORMAT':"'BOTH'"}
jobs['audit_annual']=params
points=[dt.datetime.fromisoformat(d+'T'+t)-dt.timedelta(hours=2) for d,t in zip(dates,times) if t]
q={**params,'CENTER':"'coord@399'",'COORD_TYPE':"'GEODETIC'",'SITE_COORD':"'28.9784,41.0082,0.03'",'QUANTITIES':"'2,4,19,20,23,24'",'TLIST':"'"+' '.join(str(jd(d)) for d in points)+"'"}
jobs['audit_windows']=q;jobs['audit_window_sun']={**q,'COMMAND':"'10'",'QUANTITIES':"'2,4,20'"}
trans={**q,'START_TIME':"'1910-05-19 03:20'",'STOP_TIME':"'1910-05-19 04:50'",'STEP_SIZE':"'1 m'",'QUANTITIES':"'2,4,13,20,23'"};del trans['TLIST'];del trans['TLIST_TYPE'];jobs['audit_transit_halley']=trans;jobs['audit_transit_sun']={**trans,'COMMAND':"'10'"}
def fetch(item):
 name,params=item;url='https://ssd.jpl.nasa.gov/api/horizons.api?'+urllib.parse.urlencode(params)
 (p/(name+'_request.json')).write_text(json.dumps({'url':url,'params':params},indent=2))
 try:
  text=urllib.request.urlopen(url,timeout=90).read().decode();(p/(name+'.txt')).write_text(text);print(name,'OK' if '$$SOE' in text else text[:400],len(text))
 except Exception as e:print(name,type(e).__name__,str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:list(ex.map(fetch,jobs.items()))

