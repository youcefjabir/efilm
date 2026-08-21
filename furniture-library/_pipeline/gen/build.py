# -*- coding: utf-8 -*-
"""
PRODUKTIONSKEDJA

Varje modell går samma väg, och varje steg är återupptagbart. Tillståndet
ligger i gen/state.json så en avbruten körning kan fortsätta där den slutade
i stället för att göra om och betala om.

  1 prompt      art direction + modellens beskrivning -> bildprompt
  2 image       bildmodellen ritar designen
  3 cut         bakgrunden bort -> katalogasset med alfa
  4 plate       kvadratisk vit platta som underlag för rekonstruktionen
  5 glb         bild -> 3D-master
  6 render      normalisera mot verkliga mått, rendera exakt 90 grader topvy
  7 meta        metadata, kategori, resize, material, färger

Stegen 2, 3 och 5 är API-anrop och görs utanför den här filen. Allt annat
är filhantering och Blender, och det hör hemma i kod.
"""
import sys, os, json, re, subprocess, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import art
from models import MODELS

ROOT  = os.path.abspath(os.path.join(HERE, "..", "..", "..", "viewly-furniture-library"))
WORK  = "/tmp/viewly-work"
STATE = os.path.join(WORK, "state.json")
BY_ID = {m["id"]: m for m in MODELS}

def load():
    os.makedirs(WORK, exist_ok=True)
    if os.path.exists(STATE):
        return json.load(open(STATE, encoding="utf-8"))
    return {}
def save(s):
    json.dump(s, open(STATE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

def fill(desc, m):
    """Materialorden i beskrivningen byts mot art directionens ordlista, så
       samma träslag och samma tyg beskrivs likadant i alla åttiotre
       prompterna. Annars driver biblioteket isär i ton."""
    def rep(mo):
        k = mo.group(1)
        return art.TEXTIL.get(k) or art.TRA.get(k) or k
    return re.sub(r"\{([a-z\-]+)\}", rep, desc)

def prompt(m):
    scen = {"top": art.SCEN_TOP, "front": art.SCEN_FRONT}.get(m["view"], art.SCEN)
    return "An original %s. %s" % (fill(m["desc"], m), scen)

def cmd_prompts(ids):
    """Skriver ut en färdig requests-lista för bildbatchen."""
    out = []
    for i, mid in enumerate(ids):
        m = BY_ID[mid]
        ar = "1:1"
        out.append(dict(index=i, params=dict(model="nano_banana_pro", aspect_ratio=ar,
                                             use_unlim=False, prompt=prompt(m))))
    print(json.dumps(out, ensure_ascii=False))

def _dl(url, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.check_call(["curl", "-sSf", "-o", path, url])
    return path

def cmd_images(pairs):
    s = load()
    for p in pairs:
        mid, url = p.split("=", 1)
        d = os.path.join(WORK, mid); os.makedirs(d, exist_ok=True)
        _dl(url, os.path.join(d, "source.png"))
        s.setdefault(mid, {})["source"] = url
        s[mid]["step"] = "image"
        print("bild", mid)
    save(s)

def cmd_cuts(pairs):
    """Fribild in, katalogasset och 3D-platta ut."""
    from cutout import trim, on_white
    from PIL import Image
    s = load()
    for p in pairs:
        mid, url = p.split("=", 1)
        m = BY_ID[mid]
        d = os.path.join(WORK, mid)
        raw = _dl(url, os.path.join(d, "cut_raw.png"))
        im = trim(Image.open(raw).convert("RGBA"), pad_frac=0.05)
        im.save(os.path.join(d, "catalog_full.png"))
        on_white(im).save(os.path.join(d, "plate.png"))
        s.setdefault(mid, {})["cut"] = url
        s[mid]["step"] = "cut"
        a = im.split()[3]
        s[mid]["cut_px"] = list(im.size)
        print("frilagd", mid, im.size)
    save(s)

def cmd_uploads(ids):
    """Filnamnen som ska laddas upp för 3D-steget."""
    print(json.dumps([dict(filename="%s_plate.png" % i, content_type="image/png")
                      for i in ids]))

def cmd_glbs(pairs):
    s = load()
    for p in pairs:
        mid, url = p.split("=", 1)
        _dl(url, os.path.join(WORK, mid, "master.glb"))
        s.setdefault(mid, {})["glb"] = url
        s[mid]["step"] = "glb"
        print("mesh", mid)
    save(s)

if __name__ == "__main__":
    c = sys.argv[1]
    if   c == "prompts": cmd_prompts(sys.argv[2:])
    elif c == "images":  cmd_images(sys.argv[2:])
    elif c == "cuts":    cmd_cuts(sys.argv[2:])
    elif c == "uploads": cmd_uploads(sys.argv[2:])
    elif c == "glbs":    cmd_glbs(sys.argv[2:])
    elif c == "show":
        for mid in sys.argv[2:]:
            print(prompt(BY_ID[mid]))
    else: raise SystemExit("okänt kommando: " + c)
