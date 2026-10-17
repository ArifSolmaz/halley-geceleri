"""Download/replay the recorded Horizons requests. Existing raw files are retained.
Usage: python fetch_horizons.py [--refresh]
Requires only Python's standard library. Reads are independent and run in parallel.
"""
import urllib.request,concurrent.futures,pathlib,json,sys,time
ROOT=pathlib.Path(__file__).parent/'raw'
def fetch(path):
 name=path.name.replace('_request.json','');dest=ROOT/(name+'.txt')
 if dest.exists() and '--refresh' not in sys.argv:return name+': cached'
 request=json.loads(path.read_text())
 for attempt in range(3):
  try:
   with urllib.request.urlopen(request['url'],timeout=180) as r:text=r.read().decode()
   if '$$SOE' not in text:raise ValueError(text[:1000])
   dest.write_text(text);return name+': downloaded'
  except Exception:
   if attempt==2:raise
   time.sleep(2)
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
  for result in executor.map(fetch,sorted(ROOT.glob('*_request.json'))):print(result)
