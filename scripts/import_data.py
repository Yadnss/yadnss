#!/usr/bin/env python3
import pymongo as mgo
from collections import defaultdict
from dnestpy import DNTFile, UIString
from pathlib import Path

##########
# Mongo Connection
##########
client = mgo.MongoClient()
db = client[input('MongoDB name: ')]

# reset collections
db.drop_collection('jobs')
db.drop_collection('skills')

##########
# Read UIString
##########
uistring = UIString('./extract/uistring.xml')

##########
# Parse Job Objects
##########

# make and insert job dicts from dnt rows
for row in DNTFile('./extract/jobtable.dnt').rows:
    try:
        name = uistring[row.JobName]
        ultId = [int(x) for x in row.ExSkill.split(';')]
    except ValueError:
        ultId = []
    except KeyError:
        continue

    db.jobs.insert({
        'jobId': row.id,
        'name': name,
        'parentId': row.ParentJob,
        'tier': row.JobNumber,
        'ultId': ultId
    })

# fix parent references
db.jobs.update(
    {'parentId': 0},
    {'$set': {'parent': None}, '$unset': {'parentId': ''}},
    multi=True)
for job in list(db.jobs.find()):
    db.jobs.update(
        {'parentId': job['jobId']},
        {'$set': {'parent': job['_id']}, '$unset': {'parentId': ''}},
        multi=True)

# dict of jobId: jobObj
jobs = {j['jobId']: j for j in db.jobs.find()}

##########
# Parse Skill Objects
##########

# read initial skill info from skilltable_character.dnt
for row in DNTFile('./extract/skilltable_character.dnt').rows:
    try:
        # lookup skill name and job
        name = uistring[row.NameID]
        job = jobs[row.NeedJob]
    except KeyError:
        # if lookup fails its an unused/invalid entry
        continue

    # entries with icon_index 1215 are unused
    if row.IconImageIndex == 1215:
        continue

    db.skills.insert({
        'skillId': row.id,
        'name': name,
        'job': job['_id'],
        'icon_index': row.IconImageIndex,
        'ultimate': row.id in job['ultId']
    })

# dict of skillId: skillObj
skills = {s['skillId']: s for s in db.skills.find()}

# remove skillId field, its unneeded
db.skills.update({}, {'$unset': {'skillId': ''}}, multi=True)

# read more skill info from skilltreetable
for row in DNTFile('./extract/skilltreetable.dnt').rows:
    try:
        skill = skills[row.SkillTableID]
    except KeyError:
        continue

    # parse requisite skills
    for n in range(1, 4):
        required_skills = []
        try:
            parent = skills[getattr(row, 'ParentSkillID{}'.format(n))]['_id']
            level = getattr(row, 'NeedParentSkillLevel{}'.format(n))
            required_skills.append({'skill': parent, 'level': level})
        except KeyError:
            continue

    skill['tree_index'] = row.TreeSlotIndex
    skill['required_skills'] = required_skills
    skill['required_sp'] = [
        row.NeedBasicSP1,
        row.NeedFirstSP1,
        row.NeedSecondSP1
    ]

# Read and organize skilllevels into temporary dict
slevels = defaultdict(lambda: defaultdict(list))
for p in Path('./extract').glob('skillleveltable_character*.dnt'):
    for row in DNTFile(p).rows:
        slevels[row.SkillIndex][row.SkillLevel].append(row)

# parse skill level information
# Most (but not all) skill level id's are of the binary form
# 0b100000?000000ssssssssssssllllll
#     pvp?1:0      skillId    level
# We can be sure that for any paired pve/pvp skilllevel entries
# the pvp level has the higher id
for k, v in slevels.items():
    try:
        skill = skills[k]
        description = uistring[v[1][0].SkillExplanationID]
    except KeyError:
        continue

    skill['levels'] = [0]*len(v)
    skill['description'] = description
    cumcost = 0
    for lvl, row in sorted(v.items(), key=lambda x: x[0]):
        pve, pvp = row
        cumcost += pve.NeedSkillPoint
        skill['levels'][lvl-1] = {
            'character_level': pve.LevelLimit,
            'mp_cost': {
                'pve': pve.DecreaseSP*0.1,
                'pvp': pvp.DecreaseSP*0.1
            },
            'cooldown': {
                'pve': pve.DelayTime*0.001,
                'pvp': pvp.DelayTime*0.001
            },
            'description_params': {
                'pve': pve.SkillExplanationIDParam,
                'pvp': pvp.SkillExplanationIDParam,
            },
            'sp_cost': pve.NeedSkillPoint,
            'sp_cost_cumulative': cumcost
        }
    db.skills.save(skill)
