'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	Job = mongoose.model('Job'),
	Skill = mongoose.model('Skill');

/**
 * Globals
 */
var job, child;

/**
 * Unit tests
 */
describe('Job Model Unit Tests:', function() {
	beforeEach(function(done) {

		job = new Job({
			name: 'Job'
		});
		child = new Job({
			name: 'Child Job',
			parent: job
		});

		done();
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return job.save(function(err) {
				should.not.exist(err);
				child.save(function(err) {
					should.not.exist(err);
					done();
				});
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			job.name = '';

			return job.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should remove children when deleted', function(done) {
			// Save parent and child
			job.save(function() {
				child.save(function() {
					// Delete parent job
					job.remove(function(err) {
						should.not.exist(err);

						// Check that both parent and child got deleted
						Job.find({}, function(err, jobs) {
							jobs.should.have.length(0);
							done();
						});
					});
				});
			});
		});

		it('should remove related skills when deleted', function(done) {
			job.save(function() {
				var skill = new Skill({ name: 'Skill', job: job });
				skill.save(function() {
					job.remove(function(err) {
						should.not.exist(err);
						Skill.find({}, function(err, skills) {
							should.not.exist(err);
							skills.should.have.length(0);
							done();
						});
					});
				});
			});
		});

		it('should not remove parents when deleted', function(done) {
			// Save parent and child
			job.save(function() {
				child.save(function() {
					// Delete child job
					child.remove(function(err) {
						should.not.exist(err);

						// Check that parent still exists
						Job.find({}, function(err, jobs) {
							jobs.should.have.length(1);
							done();
						});
					});
				});
			});
		});

		it('should automatically calculate the job tier', function(done) {
			job.save(function() {
				child.save(function() {
					job.tier.should.be.exactly(0);
					child.tier.should.be.exactly(1);
					done();
				});
			});
		});
	});

	afterEach(function(done) { 
		Job.remove().exec();
		Skill.remove().exec();

		done();
	});
});