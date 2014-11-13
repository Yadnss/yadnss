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
var job, skill, subskill;

/**
 * Unit tests
 */
describe('Skill Model Unit Tests:', function() {
	beforeEach(function(done) {
		job = new Job({
			name: 'Job'
		});
		skill = new Skill({
			name: 'Skill',
			job: job
		});
		subskill = new Skill({
			name: 'Sub Skill',
			job: job,
			required_skills: [{
				skill: skill,
				level: 1
			}]
		});

		job.save(function() { 
			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return skill.save(function(err) {
				should.not.exist(err);
				subskill.save(function(err) {
					should.not.exist(err);
					done();
				});
			});
		});

		it('should be able to show an error when saving without a name', function(done) { 
			skill.name = '';

			return skill.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when saving without a job', function(done) { 
			skill.job = null;

			return skill.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should not be required by other skills when deleted', function(done) {
			return skill.save(function() {
				subskill.save(function() {
					// Delete parent skill
					skill.remove(function(err) {
						should.not.exist(err);

						// Make sure no skill requires anything
						Skill.count(
							{ required_skills: { $not: { $size: 0 } } },
							function(err, count) {
								should.not.exist(err);
								count.should.equal(0);
								done();
							}
						);
					});
				});
			});
		});
	});

	afterEach(function(done) { 
		Skill.remove().exec();
		Job.remove().exec();

		done();
	});
});