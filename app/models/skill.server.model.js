'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Skill;

/**
 * SLevel (Skill Level) Schema
 */
var SLevelSchema = new Schema({
	character_level: {
		type: Number
	},
	mp_cost: {
		pve: Number,
		pvp: Number
	},
	cooldown: {
		pve: Number,
		pvp: Number
	},
	description_params: {
		pve: String,
		pvp: String
	},
	sp_cost: {
		type: Number
	},
	sp_cost_cumulative: {
		type: Number
	}
});

/**
 * Skill Schema
 */
var SkillSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Skill name',
		trim: true
	},
	job: {
		type: Schema.ObjectId,
		ref: 'Job',
		required: 'Please assign a Job'
	},
	description: {
		type: String,
		default: ''
	},
	levels: [SLevelSchema],
	required_skills: [{
		skill: {
			type: Schema.ObjectId,
			ref: 'Skill'
		},
		level: {
			type: Number,
			min: 1
		}
	}],
	required_sp: [{
		type: Number
	}],
	icon_index: {
		type: Number
	},
	tree_index: {
		type: Number
	},
	ultimate: {
		type: Boolean,
		default: false
	}
});

Skill = mongoose.model('Skill', SkillSchema);

// Remove itself from other skills requirements when deleted
SkillSchema.pre('remove', function(next) {
	Skill.update(
		{ 'required_skills.skill': this._id },
		{ $pull: { required_skills: { skill: this._id } } }
	).exec();

	next();
});