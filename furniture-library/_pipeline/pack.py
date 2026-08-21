# -*- coding: utf-8 -*-
"""
PAKETERING

Läser alla metadata.json som produktionen skrivit och bygger:
  catalog.json       index över biblioteket
  contact-sheets/    ett ark per kategori och vy, med bild + id
  qa-report.json     kontrollen i punkt 47, som data i stället för påstående
"""
import os, sys, json, glob, math
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SHEETS = os.path.join(ROOT, "contact-sheets")

def font(sz):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p):
            try: return ImageFont.truetype(p, sz)
            except Exception: pass
    return ImageFont.load_default()

def load_all():
    out = []
    for p in sorted(glob.glob(os.path.join(ROOT, "*", "*", "*", "metadata.json"))):
        with open(p, encoding="utf-8") as fh: m = json.load(fh)
        m["_dir"] = os.path.dirname(p)
        out.append(m)
    return out

# --------------------------------------------------------------- kontaktark
CHK_A, CHK_B, PAD, LAB = (232,231,228), (216,215,211), 26, 40

def checker(w, h, s=12):
    im = Image.new("RGB", (w, h), CHK_A); d = ImageDraw.Draw(im)
    for y in range(0, h, s):
        for x in range(0, w, s):
            if (x//s + y//s) % 2: d.rectangle([x, y, x+s-1, y+s-1], fill=CHK_B)
    return im

def sheet(items, view, title, out, cols=4, cell=460):
    cols = min(cols, max(1, len(items)))
    """Ett ark per kategori. Rutigt fält bakom varje bild, så transparensen
       går att kontrollera med ögat — det är halva poängen med arket."""
    n = len(items)
    if not n: return None
    rows = math.ceil(n/cols)
    W = cols*(cell+PAD) + PAD
    H = rows*(cell+LAB+PAD) + PAD + 86
    im = Image.new("RGB", (W, H), (250,249,247)); d = ImageDraw.Draw(im)
    d.text((PAD, 26), title, fill=(24,24,24), font=font(30))
    d.text((PAD, 62), "%d %s · %s" % (n, "modell" if n == 1 else "modeller", view), fill=(120,118,114), font=font(17))
    for i, it in enumerate(items):
        cx = PAD + (i % cols)*(cell+PAD)
        cy = 86 + PAD + (i//cols)*(cell+LAB+PAD)
        tile = checker(cell, cell)
        f = os.path.join(it["_dir"], view + ".webp")
        if os.path.exists(f):
            a = Image.open(f).convert("RGBA")
            a.thumbnail((cell-16, cell-16))
            tile.paste(a, ((cell-a.width)//2, (cell-a.height)//2), a)
        im.paste(tile, (cx, cy))
        d.rectangle([cx, cy, cx+cell-1, cy+cell-1], outline=(206,204,200))
        dd = it["dimensions_cm"]
        d.text((cx+2, cy+cell+6),  it["id"], fill=(24,24,24), font=font(17))
        d.text((cx+2, cy+cell+25), "%d × %d × %d cm" % (dd["width"], dd["depth"], dd["height"]),
               fill=(128,126,122), font=font(15))
    im.save(out, "WEBP", quality=88, method=6)
    return out

def build_sheets(models):
    os.makedirs(SHEETS, exist_ok=True)
    made = []
    cats = []
    for m in models:
        if m["category"] not in cats: cats.append(m["category"])
    for c in cats:
        items = [m for m in models if m["category"] == c]
        for view in ("catalog", "top"):
            p = os.path.join(SHEETS, "%s-%s.webp" % (c, view))
            if sheet(items, view, "%s — %s view" % (c, view), p): made.append(p)
    return made

# --------------------------------------------------------------- index + qa
def build_catalog(models):
    doc = dict(
        library_version="1.0",
        phase="1 — visual QA",
        generated_from="parametric 3D master models rendered in Cycles",
        conventions=dict(
            units="cm",
            catalog_view=dict(camera="perspective 85mm", azimuth_deg=34, elevation_deg=21,
                              background="transparent", format="webp"),
            top_view=dict(camera="orthographic", angle="90deg straight down",
                          px_per_cm=6.0, padding_cm=6.0,
                          background="transparent", format="webp"),
            masks=dict(format="png", value="white = material, black = other, "
                                            "transparent = outside object",
                       per_view=True, empty_masks="never written"),
            footprint="physical furniture only; canvas padding and shadow excluded"),
        material_groups=["fabric", "pattern", "wood", "metal", "stone"],
        models=[dict(id=m["id"], name=m["name"], category=m["category"],
                     subcategory=m["subcategory"], style=m["style"],
                     folder="%s/%s/%s/" % (m["category"], m["subcategory"], m["id"]),
                     dimensions_cm=m["dimensions_cm"], footprint_cm=m["footprint_cm"],
                     materials=m["materials"], variant=m.get("variant"))
                for m in models])
    with open(os.path.join(ROOT, "catalog.json"), "w", encoding="utf-8") as fh:
        json.dump(doc, fh, ensure_ascii=False, indent=2)
    return doc

def qa(models):
    rows = []
    ids = set()
    for m in models:
        d = m["_dir"]; a = m["assets"]
        cat = Image.open(os.path.join(d, "catalog.webp"))
        top = Image.open(os.path.join(d, "top.webp"))
        fw, fd = m["footprint_cm"]["width"], m["footprint_cm"]["depth"]
        exp_w = round((fw + 12) * 6.0); exp_h = round((fd + 12) * 6.0)
        intent = m.get("design_intent_cm", {})
        dev = max(abs(m["dimensions_cm"][k] - intent.get(k, m["dimensions_cm"][k]))
                  for k in ("width","depth","height")) if intent else 0
        r = dict(id=m["id"],
                 unique_id=m["id"] not in ids,
                 catalog_alpha=cat.mode == "RGBA",
                 top_alpha=top.mode == "RGBA",
                 top_scale_ok=abs(top.size[0]-exp_w) <= 2 and abs(top.size[1]-exp_h) <= 2,
                 top_px=list(top.size), top_px_expected=[exp_w, exp_h],
                 masks_catalog=[x["material"] for x in a["masks"].get("catalog", [])],
                 masks_top=[x["material"] for x in a["masks"].get("top", [])],
                 no_empty_masks=all(x["coverage_pct"] > 0.04
                                    for v in a["masks"].values() for x in v),
                 dims_cm=m["dimensions_cm"], design_intent_cm=intent,
                 max_deviation_cm=dev)
        ids.add(m["id"]); rows.append(r)
    summ = dict(models=len(rows),
                all_transparent=all(r["catalog_alpha"] and r["top_alpha"] for r in rows),
                all_ids_unique=all(r["unique_id"] for r in rows),
                all_top_scale_exact=all(r["top_scale_ok"] for r in rows),
                no_empty_masks=all(r["no_empty_masks"] for r in rows),
                largest_dimension_deviation_cm=max(r["max_deviation_cm"] for r in rows))
    doc = dict(summary=summ, models=rows)
    with open(os.path.join(ROOT, "qa-report.json"), "w", encoding="utf-8") as fh:
        json.dump(doc, fh, ensure_ascii=False, indent=2)
    return doc

if __name__ == "__main__":
    ms = load_all()
    print("hittade", len(ms), "modeller")
    build_catalog(ms)
    print("kontaktark:", len(build_sheets(ms)))
    q = qa(ms)
    print(json.dumps(q["summary"], ensure_ascii=False, indent=2))
