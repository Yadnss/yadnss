# Scripts
========

A collection of tools for generating static assets for Yadnss.

## generate-ssl-certs.sh
------------------------

Use this to generate self-signed ssl certs for the site. Just run the script
and follow the prompts.

## adduser.js
-------------

An interactive prompt for adding users to the database

Usage:
```
node adduser.js
```

## extract_files.py
-------------------

This extracts the relevant files from DragonNest game paks. Requires python
>= 3.0. It is recommended to run this with a 
[virtual environment](https://docs.python.org/3/library/venv.html) active.

Usage:
```
$ pip install requirements.txt
$ python extract_files.py
```
