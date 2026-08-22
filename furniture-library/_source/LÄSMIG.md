# Källbilder — produktionsbatch 01

Lägg beställarens ChatGPT-bilder här, en fil per modell, namngivna efter
sitt permanenta ID:

```
viewly-01-norr.png
viewly-02-solvik.png
...
viewly-20-tora.png
viewly-22-pelare.png
```

Filnamnet ÄR ID-kopplingen. Det är avsiktligt: ID:na är permanenta och en
felkoppling går inte att upptäcka i efterhand när assetet väl är byggt.
Att läsa ordningen ur uppladdningsföljden vore en gissning, och en
gissning duger inte för något som ska vara permanent.

Det finns ingen fil för ID 21. Den är medvetet utelämnad ur beställarens
lista och ska varken skapas, härledas eller fyllas.

Kraven på bilderna står i `_pipeline/gen/art.py`. Det som avgör mest:
kameran ska ligga omkring fyrtio grader ovanifrån, annars hamnar inte
möbelns ovansida i 3D-rekonstruktionen — och ovansidan är topvyn, som är
bibliotekets huvudprodukt.
