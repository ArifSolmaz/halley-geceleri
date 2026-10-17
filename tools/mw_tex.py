import json, pathlib, base64, io, numpy as np
HERE = pathlib.Path(__file__).resolve().parent
from PIL import Image, ImageDraw, ImageFilter
W,H=2048,1024
mw=json.load(open(HERE/'mw_date.json'))
acc=np.zeros((H,W),np.float32)
def unwrap(ring):
    out=[list(ring[0])]
    for lo,la in ring[1:]:
        p=out[-1][0]
        while lo-p>180: lo-=360
        while lo-p<-180: lo+=360
        out.append([lo,la])
    return out
def px(lo,la): return ((lo/360.0)*W, (90-la)/180.0*H)
def draw_ring(d,ring,val):
    r=unwrap(ring); span=r[-1][0]-r[0][0]
    if abs(span)>180:  # encircles a pole
        pole=90 if np.mean([p[1] for p in r])>0 else -90
        r=r+[[r[-1][0],pole],[r[0][0],pole]]
    for sh in (-360,0,360):
        d.polygon([px(lo+sh,la) for lo,la in r],fill=val)
weights={'ol1':0.16,'ol2':0.16,'ol3':0.18,'ol4':0.22,'ol5':0.28}
for f in mw:
    w=weights.get(f['id'],0.2)
    for poly in f['polys']:
        im=Image.new('L',(W,H),0); d=ImageDraw.Draw(im)
        draw_ring(d,poly[0],255)
        for hole in poly[1:]: draw_ring(d,hole,0)
        acc+=np.asarray(im,np.float32)/255.0*w
img=Image.fromarray(np.clip(acc/ acc.max()*255,0,255).astype(np.uint8))
img=img.filter(ImageFilter.GaussianBlur(5))
# add fine mottling so it reads like unresolved stars, deterministic
rng=np.random.default_rng(1910)
n=rng.random((H//4,W//4)).astype(np.float32)
noise=np.asarray(Image.fromarray((n*255).astype(np.uint8)).resize((W,H),Image.BICUBIC),np.float32)/255
a=np.asarray(img,np.float32)/255*(0.82+0.36*noise)
out=Image.fromarray(np.clip(a*255,0,255).astype(np.uint8)).resize((1024,512),Image.LANCZOS)
b=io.BytesIO(); out.save(b,'PNG',optimize=True)
(HERE.parent/'data'/'milkyway.js').write_text('/* Samanyolu dokusu: d3-celestial mw.json (BSD-3) konturlarından üretildi; 1910.37 ekinoksu, eşdikdörtgen RA/Dec. */\nwindow.MILKYWAY="data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()+'";\n')
print(acc.max())
