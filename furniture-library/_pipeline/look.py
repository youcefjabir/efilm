import sys, os
from PIL import Image
def sheet(pairs, out, cw=520, tw=760):
    tiles=[]
    for path, W, H in pairs:
        im=Image.open(path); bg=Image.new('RGB',(W,H),(214,214,211)); px=bg.load()
        for y in range(0,H,14):
            for x in range(0,W,14):
                if (x//14+y//14)%2:
                    for j in range(y,min(y+14,H)):
                        for i in range(x,min(x+14,W)): px[i,j]=(196,196,193)
        im=im.copy(); im.thumbnail((W-16,H-16))
        bg.paste(im,((W-im.width)//2,(H-im.height)//2),im); tiles.append(bg)
    tw_=sum(t.width for t in tiles)+20*(len(tiles)-1)
    th=max(t.height for t in tiles)
    o=Image.new('RGB',(tw_,th),(150,150,148)); x=0
    for t in tiles: o.paste(t,(x,(th-t.height)//2)); x+=t.width+20
    o.save(out); print(out, o.size)
if __name__=="__main__":
    d=sys.argv[1]
    p=[(os.path.join(d,'catalog.png'),560,560),(os.path.join(d,'top.png'),820,460)]
    sheet([x for x in p if os.path.exists(x[0])], sys.argv[2])
