# -*- coding: utf-8 -*-
import sys, os
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from logogen import *
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'svg')
os.makedirs(D, exist_ok=True)
rader=[]
print("REN — ett fält, en märkesfärg")
print("  %-16s %-9s %-9s %8s" % ("namn","fält","märke","kontrast"))
for namn,bg,ink,txt in REN:
    k=kontrast(P[bg],P[ink])
    open(D+'/viewly-ren-'+namn+'.svg','w').write(tile(P[bg],P[ink],P[ink]))
    print("  %-16s %-9s %-9s %7.1f:1  %s" % (namn,bg,ink,k,"" if k>=4.5 else "UNDER 4,5"))
print()
print("TVÅ TONER — lem och punkt skilda åt")
print("  %-20s %-9s %-9s %-9s %8s %8s" % ("namn","fält","lem","punkt","lem","punkt"))
for namn,bg,ink,dot,txt in TVA:
    k1,k2=kontrast(P[bg],P[ink]),kontrast(P[bg],P[dot])
    open(D+'/viewly-tva-'+namn+'.svg','w').write(tile(P[bg],P[ink],P[dot]))
    print("  %-20s %-9s %-9s %-9s %6.1f:1 %6.1f:1%s" % (namn,bg,ink,dot,k1,k2,
      "" if min(k1,k2)>=4.5 else "   <- under 4,5"))
# märket ensamt, utan fält
open(D+'/viewly-marke-svart.svg','w').write(marke_ensam(P['svart'],P['svart']))
open(D+'/viewly-marke-papper.svg','w').write(marke_ensam(P['papper'],P['papper']))
open(D+'/viewly-marke-tva.svg','w').write(marke_ensam(P['svart'],P['oliv']))
print()
print("skrivet:", len(os.listdir(D)), "filer i", D)
