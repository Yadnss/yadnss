#!/usr/bin/env python3
from dnestpy import PAKArchive
from pathlib import Path

##########
# Config
##########

# Required game files
required_files = {
    # Required game archive
    'Resource00.pak': [
        # Files needed from that archive
        'resource/uistring/uistring.xml',
        'resource/ui/mainbar/skillicon*.dds'
    ],
    'Resource04.pak': [
        'resource/ext/jobtable.dnt',
        'resource/ext/skillleveltable_character*.dnt',
        'resource/ext/skillleveltable_totalskill.dnt',
        'resource/ext/skilltable_character.dnt',
        'resource/ext/skilltreetable.dnt',
    ]
}

# Folder to extract files to
outdir = Path('./extract')

##########
# Utility functions
##########

def valid_dnpath(path):
    """Ensure needed dragonnest files are in the directory"""
    return all((path/f).is_file() for f in required_files)

def match_any(pakfile, patternset):
    """Returns true if path matches any pattern from paternset"""
    return any(pakfile.path.match(p) for p in patternset)

##########
# Main Script
##########

print('Enter your dragonnest game folder e.g., C:\\Nexon\\DragonNest')
dnpath = Path(input('DragonNest path: '))

while not valid_dnpath(dnpath):
    print('\nGame files not found')
    print('The folder must contain "Resource00.pak" and "Resource04.pak"')
    dnpath = Path(input('DragonNest path: '))

# Extract required files
for pakname, filepatterns in required_files.items():
    with PAKArchive(dnpath/pakname) as pak:
        pakfiles = filter(lambda x: match_any(x, filepatterns), pak.files)
        for pakfile in pakfiles:
            pakfile.extract(outdir, fullpath=False, overwrite=True)
