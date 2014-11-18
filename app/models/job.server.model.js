'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Job Schema
 */
var JobSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Job name',
		trim: true
	},
	parent: {
		type: Schema.ObjectId,
		ref: 'Job'
	},
	tier: {
		type: Number
	}
});

var Job = mongoose.model('Job', JobSchema);

// automatically set tier count
JobSchema.pre('save', function(next) {
	this.populate({ path: 'parent', select: 'tier' }, function(err, job) {
		job.tier = job.parent ? job.parent.tier + 1 : 0;
		next();
	});
});

JobSchema.pre('remove', function(next) {
	// Delete related skills
	mongoose.model('Skill').remove({job: this._id}).exec();

	// Cascade delete children
	Job.remove({parent: this._id}).exec();
	next();
});