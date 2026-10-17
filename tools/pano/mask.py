import numpy as np, sys
from PIL import Image
import scipy.ndimage as nd
im=Image.open(__import__('os').environ.get('BERGGREN','berggren_16000.jpg')).convert('RGB')
A=np.asarray(im).astype(np.float32)
L=A.mean(2)
H,W=L.shape
seams=[0,1527,3150,4758,6365,7973,9591,11204,12819,14429,16000]
TRIM=10
def land_mask(d,lo,hi,rows):
    weak=d>lo; strong=d>hi
    lab,n=nd.label(weak)
    keep=np.zeros(n+1,bool); keep[np.unique(lab[-5:,:])]=True
    ks=np.zeros(n+1,bool); ks[np.unique(lab[strong])]=True
    keep&=ks; keep[0]=False
    land=keep[lab]
    land=nd.binary_closing(land,np.ones((3,3)))
    land=nd.binary_fill_holes(land)
    base=nd.binary_opening(land,np.ones((1,17)))
    base=nd.binary_fill_holes(base|(rows>H*0.7))
    sky_end=nd.median_filter(np.argmax(base,axis=0).astype(np.float32),5)
    return land,base,sky_end
def mask_panel(x0,x1,lo=6.0,hi=12.0):
    P=L[:,x0:x1]
    Ps=nd.gaussian_filter(P,1.0)
    top=Ps[15:110]
    ref=np.percentile(top,55,axis=0); ref=nd.uniform_filter1d(ref,81)
    d=ref[None,:]-Ps
    rows=np.arange(H,dtype=np.float32)[:,None]
    landW,baseW,skyW=land_mask(d,lo,hi,rows)
    landS,baseS,skyS=land_mask(nd.gaussian_filter(d,1.5),11.0,16.0,rows)
    solid=np.clip((rows-skyS[None,:]+1.0)/2.0,0,1)
    haze=np.clip((nd.gaussian_filter(d,2.0)-lo)/(16.0-lo),0,1)*(rows>=skyW[None,:])
    thin=(landW&~baseW).astype(np.float32)*np.clip((d-lo)/8,0,1)
    alpha=np.maximum.reduce([solid,haze,nd.gaussian_filter(thin,0.6)])
    alpha=nd.gaussian_filter(alpha,0.5)
    return alpha,skyS
def panel(k):
    x0,x1=seams[k]+TRIM,seams[k+1]-TRIM
    if k==0: x0=seams[0]+4
    if k==9: x1=seams[10]-4
    a,se=mask_panel(x0,x1)
    return x0,x1,a,se
if __name__=='__main__':
    for k in map(int,sys.argv[1:]):
        x0,x1,a,se=panel(k)
        rgb=A[:,x0:x1]
        bg=np.zeros_like(rgb); bg[...,2]=120; bg[...,0]=20
        out=rgb*a[...,None]+bg*(1-a[...,None])
        Image.fromarray(out.clip(0,255).astype(np.uint8)).crop((0,0,x1-x0,600)).save(f'/home/claude/build/pano/test{k}.jpg')
