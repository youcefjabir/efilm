# -*- coding: utf-8 -*-
"""
OMFÄRGNINGSBEVIS

Punkt 50 frågar: fungerar materialmaskerna? Det går inte att svara på i
ord. Den här filen färgar om ett material i en färdig render med hjälp
av masken och sparar före/efter, så frågan kan besvaras med ögat.

Metoden är den som en riktig editor skulle använda: behåll bildens
luminans, byt kulören, och gör det ENDAST där masken är vit. Skuggor,
sömmar och dagrar ligger kvar eftersom de bor i luminansen.
"""
import os, json, numpy as np
from PIL import Image

def _srgb_to_lin(a): return np.where(a <= .04045, a/12.92, ((a+.055)/1.055)**2.4)
def _lin_to_srgb(a): return np.where(a <= .0031308, a*12.92, 1.055*a**(1/2.4)-.055)

def recolor(img_path, mask_path, target_rgb, out_path, keep=0.82):
    """target_rgb i 0–1 sRGB. keep styr hur mycket av originalets
       ljushetsvariation som behålls — 1.0 = all struktur kvar."""
    im = Image.open(img_path).convert("RGBA")
    mk = Image.open(mask_path).convert("RGBA").resize(im.size, Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)/255.0
    m = np.asarray(mk).astype(np.float32)/255.0
    sel = (m[...,0] * m[...,3])[..., None]          # vit OCH ogenomskinlig

    lin = _srgb_to_lin(a[...,:3])
    lum = (lin*np.array([.2126,.7152,.0722])).sum(-1, keepdims=True)
    tgt = _srgb_to_lin(np.array(target_rgb, dtype=np.float32))[None,None,:]
    # medelluminansen i det maskade området blir referens, så den nya
    # färgen hamnar på samma ljushet som den gamla i stället för att
    # bränna ut eller mörkna
    w = sel[...,0]
    ref = float((lum[...,0]*w).sum()/max(w.sum(), 1e-6))
    tl  = float((tgt*np.array([.2126,.7152,.0722])).sum())
    scaled = tgt * np.clip(lum/max(ref,1e-6), 0.0, 3.0)**keep
    outlin = lin*(1-sel) + scaled*sel
    rgb = np.clip(_lin_to_srgb(np.clip(outlin, 0, 1)), 0, 1)
    res = np.concatenate([rgb, a[...,3:]], -1)
    Image.fromarray((res*255).astype(np.uint8), "RGBA").save(out_path)
    return out_path

if __name__ == "__main__":
    import sys
    from lib.mats import PALETTE
    d, mat, col, out = sys.argv[1:5]
    recolor(os.path.join(d,"catalog.webp"), os.path.join(d,"masks","catalog",mat+".png"),
            PALETTE[col], out)
    print(out)
