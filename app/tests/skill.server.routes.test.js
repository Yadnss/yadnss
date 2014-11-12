'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Job = mongoose.model('Job'),
	Skill = mongoose.model('Skill'),
	agent = request.agent(app);

/**
 * Globals
 */
var ucred, acred, user, admin, job, skill, subskill;

/**
 * Skill routes tests
 */
describe('Skill CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		ucred = {
			username: 'username',
			password: 'password'
		};
		acred = {
			username: 'admin',
			password: 'password'
		};

		// Create dependency models
		user = new User({
			firstName: 'User',
			lastName: 'Name',
			displayName: 'User Name',
			email: 'test@test.com',
			username: ucred.username,
			password: ucred.password,
			roles: ['user'],
			provider: 'local'
		});
		admin = new User({
			firstName: 'Admin',
			lastName: 'Name',
			displayName: 'Admin Name',
			email: 'test@test.com',
			username: acred.username,
			password: acred.password,
			roles: ['user', 'admin'],
			provider: 'local'
		});
		job = new Job({ name: 'Job Name' });


		// Save users to the test db and create new Job
		user.save(function() {
			admin.save(function() {
				job.save(function() {
					// Testing models
					skill = {
						name: 'Skill',
						job: job._id
					};
					subskill = {
						name: 'Sub Skill',
						job: job._id,
						required_skills: [{
							skill: null,
							level: 1
						}]
					};

					done();
				});
			});
		});
	});

	it('should be able to save Skill instance if logged in as admin', function(done) {
		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				if (signinErr) done(signinErr);

				// Save a new Skill
				agent.post('/skills')
					.send(skill)
					.expect(200)
					.end(function(saveErr, saveRes) {
						if (saveErr) done(saveErr);

						// Get a list of Skills
						agent.get('/skills')
							.end(function(getErr, getRes) {
								if (getErr) done(getErr);

								(getRes.body[0].name).should.match('Skill');
								done();
							});
					});
			});
	});

	it('should not be able to save Skill instance if logged in as user', function(done) {
		agent.post('/auth/signin')
			.send(ucred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Save a new skill
				agent.post('/skills')
					.send(skill)
					.expect(403)
					.end(function(saveErr, saveRes) {
						(saveRes.text).should.match('User is not authorized');
						done(saveErr);
					});
			});
	});

	it('should not be able to save Skill instance if not logged in', function(done) {
		agent.post('/skills')
			.send(skill)
			.expect(401)
			.end(function(saveErr, saveRes) {
				done(saveErr);
			});
	});

	it('should not be able to save Skill instance if no name is provided', function(done) {
		skill.name = '';

		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				if (signinErr) done(signinErr);

				// Save a new Skill
				agent.post('/skills')
					.send(skill)
					.expect(400)
					.end(function(saveErr, saveRes) {
						(saveRes.body.message).should.match('Please fill Skill name');
						done(saveErr);
					});
			});
	});

	it('should not be able to save Skill instance if no job is provided', function(done) {
		skill.job = null;

		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				if (signinErr) done(signinErr);

				// Save a new Skill
				agent.post('/skills')
					.send(skill)
					.expect(400)
					.end(function(saveErr, saveRes) {
						(saveRes.body.message).should.match('Please assign a Job');
						done(saveErr);
					});
			});
	});

	it('should be able to update Skill instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				if (signinErr) done(signinErr);

				// Save a new skill
				agent.post('/skills')
					.send(skill)
					.expect(200)
					.end(function(saveErr, saveRes) {
						if (saveErr) done(saveErr);

						// Update Skill name
						skill.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Skill
						agent.put('/skills/' + saveRes.body._id)
							.send(skill)
							.expect(200)
							.end(function(updateErr, updateRes) {
								if (updateErr) done(updateErr);

								(updateRes.body._id).should.equal(saveRes.body._id);
								(updateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');
								done();
							});
					});
			});
	});

	it('should be able to get a list of Skills if not signed in', function(done) {
		var skillObj = new Skill(skill);
		skillObj.save(function() {
			// Request Skills
			request(app).get('/skills')
				.end(function(req, res) {
					res.body.should.be.an.Array.with.lengthOf(1);
					done();
				});
		});
	});


	it('should be able to get a single Skill if not signed in', function(done) {
		var skillObj = new Skill(skill);
		skillObj.save(function() {
			request(app).get('/skills/' + skillObj._id)
				.end(function(req, res) {
					res.body.should.be.an.Object.with.property('name', skill.name);
					done();
				});
		});
	});

	it('should be able to delete Skill instance if signed in as admin', function(done) {
		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				if (signinErr) done(signinErr);

				// Save a new Skill
				agent.post('/skills')
					.send(skill)
					.expect(200)
					.end(function(saveErr, saveRes) {
						if (saveErr) done(saveErr);

						agent.delete('/skills/' + saveRes.body._id)
							.send(skill)
							.expect(200)
							.end(function(deleteErr, deleteRes) {
								if (deleteErr) done(deleteErr);

								(deleteRes.body._id).should.equal(saveRes.body._id);
								done();
							});
					});
			});
	});

	it('should not be able to delete Skill instance if signed in as user', function(done) {
		var skillObj = new Skill(skill);
		skillObj.save(function() {
			agent.post('/auth/signin')
				.send(ucred)
				.expect(200)
				.end(function(signinErr, signinRes) {
					if (signinErr) done(signinErr);

					agent.delete('/skills/' + skillObj._id)
						.send(skill)
						.expect(403)
						.end(function(deleteErr, deleteRes) {
							(deleteRes.text).should.match('User is not authorized');
							done(deleteErr);
						});
				});
		});
	});

	it('should not be able to delete Skill instance if not signed in', function(done) {
		var skillObj = new Skill(skill);
		skillObj.save(function() {
			request(app).delete('/skills/' + skillObj._id)
			.expect(401)
			.end(function(deleteErr, deleteRes) {
				(deleteRes.body.message).should.match('User is not logged in');
				done(deleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Job.remove().exec();
		Skill.remove().exec();
		done();
	});
});