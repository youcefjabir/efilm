# -*- coding: utf-8 -*-
"""
GEOMETRIMÄTNING

"Inte symmetrisk" och "vinklarna stämmer inte" ska vara tal, inte
tyckande. Fyra mått, alla i procent så de går att jämföra mellan objekt
av olika storlek.

SYMMETRI      Nästan alla möbler är spegelsymmetriska kring sin mittlinje.
              Meshen speglas i planet x=0 och varje hörn får söka sitt
              närmaste original. Medelavståndet, i procent av bredden, är
              felet. Under 1 procent är omärkligt vid vår skala.

RÄTVINKLIGHET Hur stor del av ytan som ligger inom 8 grader från något av
              de tre huvudplanen. En bordsskiva, en gavel och ett ben är
              plana och rätvinkliga i verkligheten; en rekonstruktion som
              vågar sig blir en mjuk klump.

PLANHET       Hur plan den översta ytan är. Det är den ytan topvyn visar,
              så en bucklig bordsskiva syns direkt i leveransen.

FYLLNAD       Hur stor del av fotavtrycket som är täckt sett uppifrån.
              Skiljer en soffa (hög fyllnad) från ett bord (låg, bara skiva).
"""
import sys, json, math
sys.path.insert(0, "/home/user/efilm/furniture-library/_pipeline")
import bpy, numpy as np
from mathutils import Vector

def _verts_world(P):
    out = []
    for o in P:
        mw = o.matrix_world
        vs = np.empty((len(o.data.vertices), 3), np.float64)
        o.data.vertices.foreach_get("co", vs.reshape(-1))
        M = np.array(mw.to_4x4())
        vs = vs @ M[:3, :3].T + M[:3, 3]
        out.append(vs)
    return np.vstack(out)

def _tris(P):
    """Triangelnormaler och areor i världskoordinater."""
    N, A = [], []
    for o in P:
        me = o.data; me.calc_loop_triangles()
        M = np.array(o.matrix_world.to_4x4())
        vs = np.empty((len(me.vertices), 3), np.float64)
        me.vertices.foreach_get("co", vs.reshape(-1))
        vs = vs @ M[:3, :3].T + M[:3, 3]
        idx = np.array([t.vertices[:] for t in me.loop_triangles], dtype=np.int64)
        if len(idx) == 0: continue
        a, b, c = vs[idx[:,0]], vs[idx[:,1]], vs[idx[:,2]]
        cr = np.cross(b-a, c-a)
        ar = np.linalg.norm(cr, axis=1)*0.5
        ok = ar > 1e-12
        n = np.zeros_like(cr); n[ok] = cr[ok]/(2*ar[ok, None])
        N.append(n[ok]); A.append(ar[ok])
    return np.vstack(N), np.concatenate(A)

def _nn_mean(a, b, cap=20000):
    """Medelavstånd från varje punkt i a till närmaste punkt i b."""
    if len(a) > cap:
        a = a[np.random.default_rng(0).choice(len(a), cap, replace=False)]
    if len(b) > cap:
        b = b[np.random.default_rng(1).choice(len(b), cap, replace=False)]
    tot = 0.0; n = 0
    step = 2000
    for i in range(0, len(a), step):
        d = np.linalg.norm(a[i:i+step, None, :] - b[None, :, :], axis=2)
        tot += d.min(1).sum(); n += len(d)
    return tot/max(n, 1)

def measure(P):
    v = _verts_world(P)
    lo, hi = v.min(0), v.max(0)
    dim = hi - lo
    W, D, H = dim*100.0

    mirrored = v.copy()
    cx = (lo[0] + hi[0])/2
    mirrored[:, 0] = 2*cx - mirrored[:, 0]
    sym = _nn_mean(mirrored, v)/max(dim[0], 1e-9)*100.0

    n, a = _tris(P)
    ax = np.abs(n)
    ang = np.degrees(np.arccos(np.clip(ax.max(1), 0, 1)))
    ortho = float(a[ang <= 8.0].sum()/max(a.sum(), 1e-12)*100.0)

    top_band = v[:, 2] > hi[2] - max(dim[2]*0.04, 0.005)
    flat = float(np.std(v[top_band, 2])*1000.0) if top_band.sum() > 8 else 0.0

    gx = np.clip(((v[:,0]-lo[0])/max(dim[0],1e-9)*64).astype(int), 0, 63)
    gy = np.clip(((v[:,1]-lo[1])/max(dim[1],1e-9)*64).astype(int), 0, 63)
    occ = np.zeros((64,64), bool); occ[gx, gy] = True
    fill = float(occ.mean()*100.0)

    return dict(width_cm=round(W,1), depth_cm=round(D,1), height_cm=round(H,1),
                symmetry_err_pct=round(sym,3), orthogonal_pct=round(ortho,1),
                top_flatness_mm=round(flat,2), footprint_fill_pct=round(fill,1),
                tris=int(sum(len(o.data.loop_triangles) for o in P)))

def load(glb):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in (bpy.data.meshes, bpy.data.objects, bpy.data.materials, bpy.data.images):
        for x in list(c): c.remove(x)
    bpy.ops.import_scene.gltf(filepath=glb)
    return [o for o in bpy.data.objects if o.type == 'MESH']

if __name__ == "__main__":
    for g in sys.argv[1:]:
        P = load(g)
        print(g.split("/")[-2] if "/" in g else g, json.dumps(measure(P)), flush=True)
