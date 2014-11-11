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
	}
});

var Job = mongoose.model('Job', JobSchema);

// Cascade delete children
JobSchema.pre('remove', function(next) {
	Job.remove({parent: this._id}).exec();
	next();
});