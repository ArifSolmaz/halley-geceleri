#!/usr/bin/env python3
"""Build the film's deterministic recording-based stereo mix. Requires numpy/scipy/ffmpeg.
Field recording and foley sources are CC0; the historical music is public domain; see docs/film-sound.md. No wind/noise synthesis.
"""
import json,pathlib,subprocess,tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter,sosfilt
ROOT=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'data/animated-film.json').read_text());RATE=24000;N=int(manifest['duration']*RATE)
result=np.zeros((N,2),np.float32)
files={'water':('water',.052,70,6500),'gulls':('istanbul-gulls',.045,220,6000),'press':('press',.085,80,3400),'steps':('steps',.070,65,5500),'paper':('paper',.065,200,7000),'horn':('istanbul-horn',.12,65,2000),'music':('isfahan-gazel-1912',.080,150,4300)}
for name,(file,rms,lo,hi) in files.items():
 with tempfile.TemporaryDirectory() as td:
  out=pathlib.Path(td)/'audio.wav';subprocess.run(['ffmpeg','-v','error','-y','-i',str(ROOT/f'assets/audio/film/{file}{".ogg" if name=="music" else ".mp3"}'),'-af', 'afftdn=nf=-26' if name=='music' else 'anull','-ar',str(RATE),'-ac','2',str(out)],check=True)
  _,data=wavfile.read(out);data=data.astype(np.float32)/32768
 data=sosfilt(butter(2,[lo,hi],btype='bandpass',fs=RATE,output='sos'),data,axis=0).astype(np.float32)
 data*=rms/max(.0001,float(np.sqrt(np.mean(data*data))))
 if name=='horn':
  data=data[:int(6.8*RATE)];fade=np.minimum(1,np.arange(len(data))/(RATE*.15))*np.minimum(1,(len(data)-np.arange(len(data)))/(RATE*1.5));data*=fade[:,None]
  for shot in manifest['shots']:
   volume=shot['mix'].get(name,0)
   if not volume:continue
   start=int((shot['start']+2.5)*RATE);end=min(N,start+len(data));result[start:end]+=data[:end-start]*volume
   for delay,gain in [(.32,.10),(.71,.06)]:
    at=start+int(delay*RATE);end=min(N,at+len(data));result[at:end]+=data[:end-at]*volume*gain
  continue
 # Water and gulls continue across cuts, at different acoustic distances. 1.2 s edge crossfades.
 env=np.zeros(N,np.float32)
 for shot in manifest['shots']:
  a=int(shot['start']*RATE);b=int(shot['endTime']*RATE);env[a:b]=shot['mix'].get(name,0)
 # Smooth each change without a silent dip at a scene boundary.
 cross=int(RATE*.6)
 for shot in manifest['shots'][1:]:
  edge=int(shot['start']*RATE);a=max(0,edge-cross);b=min(N,edge+cross);env[a:b]=np.linspace(env[a],env[b-1],b-a)
 if name=='music':
  result[:min(N,len(data))]+=data[:min(N,len(data))]*env[:min(N,len(data)),None]
 elif name in ['water','gulls','press']:
  offset=int((20 if name=='water' else 10 if name=='gulls' else 0)*RATE)
  # Loop overlap blends the join, without repeating a short synthetic texture.
  overlap=RATE;main=data.copy();fade=np.linspace(0,1,overlap)[:,None]
  main[:overlap]=main[-overlap:]*(1-fade)+main[:overlap]*fade;main=main[:-overlap]
  tiled=main[(np.arange(N)+offset)%len(main)];result+=tiled*env[:,None]
 else:
  for shot in manifest['shots']:
   if not shot['mix'].get(name):continue
   a=int(shot['start']*RATE);b=int(shot['endTime']*RATE);rate=1.35*(1.6 if shot['action'] in ['run','fear'] else 1.2 if shot['action']=='stairs' else 1) if name=='steps' else 1
   idx=(np.arange(b-a)*rate).astype(int)%len(data);result[a:b]+=data[idx]*env[a:b,None]
fade=np.minimum(1,np.arange(N)/(RATE*.3))*np.minimum(1,(N-np.arange(N))/(RATE*1.5));result*=fade[:,None]
with tempfile.TemporaryDirectory() as td:
 out=pathlib.Path(td)/'full.wav';wavfile.write(out,RATE,np.clip(result,-1,1));subprocess.run(['ffmpeg','-v','error','-y','-i',str(out),'-af','loudnorm=I=-19:TP=-3:LRA=10','-ar','48000','-c:a','aac','-b:a','160k',str(ROOT/'assets/audio/film/full-film.m4a')],check=True)
print('Built',manifest['duration'],'seconds of stereo sound.')
