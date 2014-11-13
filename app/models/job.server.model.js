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

// Cascade delete children
JobSchema.pre('remove', function(next) {
	Job.remove({parent: this._id}).exec();
	next();
});