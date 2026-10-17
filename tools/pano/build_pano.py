# Berggren panoramasını levhalara ayırır, gök maskesini çıkarır, levhaları yapı yönlerine göre kalibre eder.
# Girdi: Commons özgün dosyası (24226×1772) 16000 piksel genişliğe küçültülmüş JPEG; yol BERGGREN ortam değişkeniyle verilir.
# Kullanım: BERGGREN=berggren_16000.jpg python3 tools/pano/build_pano.py
import numpy as np, json, math, sys
from PIL import Image
import scipy.ndimage as nd
sys.path.insert(0,__import__('os').path.dirname(__file__))
import mask as M
OUT=__import__('os').path.join(__import__('os').path.dirname(__file__),'..','..','assets','pano')
import os; os.makedirs(OUT,exist_ok=True)
A=M.A; H=M.H; seams=M.seams
# dikiş çizgilerini (albümin levhaların birleşim yeri) yatay doğrusal ara değerle sil
for sx in seams[1:-1]:
    a0,a1=sx-11,sx+11
    for i,x in enumerate(range(a0+1,a1)):
        f=(x-a0)/(a1-a0); A[:,x]=A[:,a0]*(1-f)+A[:,a1]*f
M.L[:]=A.mean(2)
# calibration (original 16000-px coordinates): az(x)=az_ref+(x-x_ref)/s ; yh = row of astronomical horizon (alt 0)
P1s=101.3+(1527-3180)/49.5
CAL={
 1:dict(ref=(3180,101.3),s=49.5,yh=300),
 2:dict(ref=(3180,101.3),s=49.5,yh=300),
 3:dict(ref=(5895,154.0),s=49.0,yh=222),
 4:dict(ref=(6610,165.0),s=48.9,yh=214),
 5:dict(ref=(8925,207.8),s=48.5,yh=176),
 6:dict(ref=(8925+125,207.8),s=48.5,yh=180),
 7:dict(ref=(11270,251.1),s=46.3,yh=185),
}
CAL[0]=dict(ref=(1527,P1s+2.5),s=49.0,yh=303)
e7=251.1+(12819-11270)/46.3
CAL[8]=dict(ref=(12819,e7-2.5),s=47.0,yh=175)
e8=e7-2.5+(14429-12819)/47.0
CAL[9]=dict(ref=(14429,e8-2.5),s=47.0,yh=170)
panels=[];lights=[]
TARGET=[(158.0,0),(131.0,0),(118.0,0)]
rng=np.random.default_rng(1910)
for k in range(10):
    trimL=0 if k==2 else (4 if k==0 else 12)
    trimR=0 if k==1 else (4 if k==9 else 12)
    x0=seams[k]+trimL; x1=seams[k+1]-trimR
    a,se=M.mask_panel(x0,x1)
    top=int(max(0,np.percentile(se,1)-140)); top=min(top,int(se.min())-20); top=max(0,top)
    rgb=A[top:,x0:x1].copy(); al=a[top:]
    land=al>0.98
    # sütun boyunca düşük frekanslı ton/kontrast farkı (baskı kenarlarının solması) düzeltmesi
    Lp=rgb.mean(2); cnt=land.sum(0)+1e-3
    cm=(Lp*land).sum(0)/cnt; cs=np.sqrt(np.clip((Lp*Lp*land).sum(0)/cnt-cm*cm,1,None))
    ok=cnt>40
    cm=np.where(ok,cm,np.median(cm[ok])); cs=np.where(ok,cs,np.median(cs[ok]))
    cm=nd.uniform_filter1d(cm,151,mode='nearest'); cs=nd.uniform_filter1d(cs,151,mode='nearest')
    gs=np.clip(np.median(cs)/cs,0.8,1.6)[None,:,None]
    rgb=(rgb-cm[None,:,None])*gs+np.median(cm)
    for ch in range(3):
        cc=(rgb[...,ch]*land).sum(0)/cnt; cc=np.where(ok,cc,np.median(cc[ok])); cc=nd.uniform_filter1d(cc,151,mode='nearest')
        rgb[...,ch]+= (np.median(cc)-cc)[None,:]
    for ch in range(3):
        v=rgb[...,ch][land]; mu,sd=v.mean(),v.std()
        rgb[...,ch]=rgb[...,ch]+(TARGET[ch][0]-mu)*0.85
    # feather left edge for overlapping seams (not for contiguous P1|P2)
    if k not in (0,2):
        ramp=np.clip(np.arange(x1-x0)/8.0,0,1)[None,:]
        al=al*ramp
    if k==0: al=al*np.clip(np.arange(x1-x0)/90.0,0,1)[None,:]
    if k==9: al=al*np.clip((x1-x0-1-np.arange(x1-x0))/90.0,0,1)[None,:]
    fb=np.clip((len(al)-1-np.arange(len(al)))/70.0,0,1)[:,None]; al=al*fb
    rgba=np.dstack([rgb,al*255]).clip(0,255).astype(np.uint8)
    im=Image.fromarray(rgba,'RGBA')
    im.save(f'{OUT}/berggren-{k}.webp',quality=82,method=6)
    im.resize((im.width//2,im.height//2),Image.LANCZOS).save(f'{OUT}/berggren-{k}-lite.webp',quality=70,method=6)
    c=CAL[k]; xr,azr=c['ref']; s=c['s']
    az0=azr+(x0-xr)/s
    panels.append(dict(k=k,w=x1-x0,h=H-top,top=top,az0=round(az0,3),s=s,yh=c['yh']))
    # lights: textured land pixels (city), avoid sky/water/very near foreground
    L=M.L[top:,x0:x1]
    sd=nd.generic_filter(L[::2,::2],np.std,size=5) if False else None
    m1=nd.uniform_filter(L,7); m2=nd.uniform_filter(L*L,7); std=np.sqrt(np.clip(m2-m1*m1,0,None))
    hh,ww=L.shape
    rows=np.arange(hh)[:,None]+top
    land=(al>0.98)
    cand=land&(std>18)&(rows>c['yh']-40)
    ys,xs=np.nonzero(cand)
    if len(ys):
        n=int(min(len(ys),  (x1-x0)*0.18))
        idx=rng.choice(len(ys),n,replace=False)
        for i in idx:
            y=ys[i]+top; x=xs[i]
            az=az0+x/s; alt=(c['yh']-y)/s
            if alt<-14: continue
            lights.append([round(az%360,3),round(alt,3),round(float(rng.random()),3)])
    print(k,x0,x1,'top',top,'az',round(az0,2),'→',round(az0+(x1-x0)/s,2),'lights',len(lights))
data=dict(src='assets/pano/berggren-{k}.webp',lite='assets/pano/berggren-{k}-lite.webp',panels=panels,lights=lights,
  credit='Guillaume Berggren, Galata Kulesi’nden İstanbul panoraması, 1880’ler (albümin baskı, 10 levha). Kamu malı — Wikimedia Commons.',
  vp=dict(lat=41.02562,lon=28.97414,eye=87))
open(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','..','data','pano.js'),'w').write('/* Berggren panoraması: levha kalibrasyonu (tools/pano/ ile üretildi). az(u)=az0+u/s ; alt(v)=(yh-(top+v))/s */\nwindow.PANO='+json.dumps(data,separators=(',',':'))+';\n')
