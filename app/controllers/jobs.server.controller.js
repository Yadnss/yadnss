'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Job = mongoose.model('Job'),
	_ = require('lodash');

/**
 * Create a Job
 */
exports.create = function(req, res) {
	var job = new Job(req.body);
	job.user = req.user;

	job.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(job);
		}
	});
};

/**
 * Show the current Job
 */
exports.read = function(req, res) {
	var jobArr = [];
	var getParent = function(err, job) {
		jobArr[job.tier] = job;

		if (err || !job.tier) {
			res.jsonp(jobArr);
		} else {
			Job.findById(job.parent._id || job.parent).exec(getParent);
		}
	};

	if (req.query.full) {
		getParent(null, req.job);
	} else {
		res.jsonp([req.job]);
	}
};

/**
 * Update a Job
 */
exports.update = function(req, res) {
	var job = req.job ;

	job = _.extend(job , req.body);

	job.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(job);
		}
	});
};

/**
 * Delete an Job
 */
exports.delete = function(req, res) {
	var job = req.job ;

	job.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(job);
		}
	});
};

/**
 * List of Jobs
 */
exports.list = function(req, res) { 
	Job.find()
		.sort('name')
		.populate('parent', 'name tier')
		.exec(function(err, jobs) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(jobs);
			}
		});
};

/**
 * Job middleware
 */
exports.jobByID = function(req, res, next, id) { 
	Job.findById(id)
		.populate('parent', 'name tier')
		.exec(function(err, job) {
			if (err) return next(err);
			if (! job) return next(new Error('Failed to load Job ' + id));
			req.job = job ;
			next();
		});
};

/**
 * Job authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (_.indexOf(req.user.roles, 'admin') === -1) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
