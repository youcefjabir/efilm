# -*- coding: utf-8 -*-
"""
FRILÄGGNING

Runtime-asseten får inte innehålla studiobakgrunden. Motivet står på en
sömlös vit fond, så bakgrunden hänger ihop från bildkanten och kan fyllas
inifrån kanten — det är säkrare än en tröskel, för en vit soffa mot vit
fond har ingen tröskel som fungerar.

Kontaktskuggan behålls som halvgenomskinlig. Den är en del av
produktbilden och ligger i alfa, precis som i det renderade biblioteket.
"""
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

def _flood_bg(lum, floor, step):
    """Bakgrunden är sammanhängande från bildkanten OCH slät.

       En absolut tröskel räcker inte: studiofonden är en gradient från
       nästan vitt upptill till ljusgrått nertill, och ett tröskelvärde som
       täcker gråtonen äter samtidigt upp en ljus soffa. Här växer området
       i stället från kanten och accepterar en granne bara om steget i
       ljushet är litet. Då följer fyllningen gradienten men stannar vid
       motivets kant, där steget är stort."""
    h, w = lum.shape
    bg = np.zeros((h, w), bool)
    q = deque()
    def seed(y, x):
        if lum[y, x] >= floor and not bg[y, x]:
            bg[y, x] = True; q.append((y, x))
    for x in range(w): seed(0, x); seed(h-1, x)
    for y in range(h): seed(y, 0); seed(y, w-1)
    while q:
        y, x = q.popleft()
        base = lum[y, x]
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y+dy, x+dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx]:
                v = lum[ny, nx]
                if v >= floor and abs(v - base) <= step:
                    bg[ny, nx] = True; q.append((ny, nx))
    return bg

def _largest_blob(alpha, thresh=0.35):
    """Etikettera sammanhängande områden i alfa och behåll det största."""
    m = alpha > thresh
    h, w = m.shape
    seen = np.zeros((h, w), np.int32)
    best_id, best_n, cur = 0, 0, 0
    for sy in range(h):
        row = m[sy]
        for sx in range(w):
            if not row[sx] or seen[sy, sx]: continue
            cur += 1; n = 0
            q = deque([(sy, sx)]); seen[sy, sx] = cur
            while q:
                y, x = q.popleft(); n += 1
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny, nx = y+dy, x+dx
                    if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = cur; q.append((ny, nx))
            if n > best_n: best_n, best_id = n, cur
    keep = (seen == best_id)
    out = alpha.copy(); out[~keep] = 0.0
    return out

def cutout(path, floor=0.80, step=0.020, soft=0.90, feather=1.2, keep_shadow=True):
    """floor = under detta är det säkert motiv. step = största tillåtna
       ljushetssprång inom bakgrunden."""
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32)/255.0
    lum = a.max(2)
    bg = _flood_bg(lum, floor, step)
    hard = 1.0
    # mjuk zon: bakgrundspixlar som gränsar till motivet tonas efter ljushet
    alpha = np.where(bg, 0.0, 1.0).astype(np.float32)
    if keep_shadow:
        # Skuggan är grå, inte vit, och ligger utanför flödesfyllningen bara
        # om den är mörkare än hard. Där den är ljusare räknas den som
        # bakgrund — det är rätt: en knappt synlig skugga ska inte bli en
        # gråskiva i asseten.
        band = (~bg) & (lum > soft)
        alpha[band] = np.clip((1.0 - lum[band])/(1.0 - soft), 0.0, 1.0)
    # Behåll bara den största sammanhängande formen. Studiobelysningens
    # reflektorskärmar syns ibland som tunna konturer högst upp i bilden;
    # de hänger inte ihop med möbeln men överlever flödesfyllningen och
    # drog beskärningen ur läge så att soffan hamnade utanför ramen.
    alpha = _largest_blob(alpha)
    am = Image.fromarray((alpha*255).astype(np.uint8))
    if feather > 0:
        am = am.filter(ImageFilter.GaussianBlur(feather))
    out = im.convert("RGBA"); out.putalpha(am)
    return out

def trim(im, pad_frac=0.04, thresh=8):
    """Beskär till motivet och lägg tillbaka en jämn marginal."""
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > thresh)
    if len(xs) == 0: return im
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    c = im.crop((int(x0), int(y0), int(x1)+1, int(y1)+1))
    p = int(max(c.size)*pad_frac)
    o = Image.new("RGBA", (c.width+2*p, c.height+2*p), (0,0,0,0))
    o.paste(c, (p, p), c)
    return o

def on_white(im, pad_frac=0.10, size=1536):
    """Kvadratisk vit platta för 3D-steget. Rekonstruktionen vill ha ett
       centrerat motiv utan bakgrundsbrus."""
    c = trim(im, pad_frac=0.0)
    S = int(max(c.size)*(1.0 + 2*pad_frac))
    o = Image.new("RGBA", (S, S), (255,255,255,255))
    o.paste(c, ((S-c.width)//2, (S-c.height)//2), c)
    return o.convert("RGB").resize((size, size), Image.LANCZOS)
