#!/usr/bin/env python3
import csv
from dnestpy import DNTFile
from pathlib import Path

filedir = Path('./extract')
for p in filedir.glob('*.dnt'):
    dnt = DNTFile(p)
    with (filedir / (p.stem + '.csv')).open('w', newline='') as outf:
        writer = csv.writer(outf)
        writer.writerow(list(col.name for col in dnt.columns))
        writer.writerows(dnt.rows)
