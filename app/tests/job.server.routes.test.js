'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Job = mongoose.model('Job'),
	agent = request.agent(app);

/**
 * Globals
 */
var ucred, acred, user, admin, job;

/**
 * Job routes tests
 */
describe('Job CRUD tests', function() {
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

		// Create a new user
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


		// Save users to the test db and create new Job
		user.save();
		admin.save();
		job = { name: 'Job Name', tier: 1 };

		done();
	});

	it('should be able to save Job instance if logged in as admin', function(done) {
		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Save a new Job
				agent.post('/jobs')
					.send(job)
					.expect(200)
					.end(function(jobSaveErr, jobSaveRes) {
						// Handle Job save error
						if (jobSaveErr) done(jobSaveErr);

						// Get a list of Jobs
						agent.get('/jobs')
							.end(function(jobsGetErr, jobsGetRes) {
								// Handle Job save error
								if (jobsGetErr) done(jobsGetErr);

								// Get Jobs list
								var jobs = jobsGetRes.body;

								// Set assertions
								(jobs[0].name).should.match('Job Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Job instance if logged in as user', function(done) {
		agent.post('/auth/signin')
			.send(ucred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Save a new job
				agent.post('/jobs')
					.send(job)
					.expect(403)
					.end(function(jobSaveErr, jobSaveRes) {
						// Set assertions
						(jobSaveRes.text).should.match('User is not authorized');

						// Call the assertion callback
						done(jobSaveErr);
					});
			});
	});

	it('should not be able to save Job instance if not logged in', function(done) {
		agent.post('/jobs')
			.send(job)
			.expect(401)
			.end(function(jobSaveErr, jobSaveRes) {
				// Call the assertion callback
				done(jobSaveErr);
			});
	});

	it('should not be able to save Job instance if no name is provided', function(done) {
		// Invalidate name field
		job.name = '';

		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Save a new Job
				agent.post('/jobs')
					.send(job)
					.expect(400)
					.end(function(jobSaveErr, jobSaveRes) {
						// Set message assertion
						(jobSaveRes.body.message).should.match('Please fill Job name');
						
						// Handle Job save error
						done(jobSaveErr);
					});
			});
	});

	it('should be able to update Job instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Save a new Job
				agent.post('/jobs')
					.send(job)
					.expect(200)
					.end(function(jobSaveErr, jobSaveRes) {
						// Handle Job save error
						if (jobSaveErr) done(jobSaveErr);

						// Update Job name
						job.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Job
						agent.put('/jobs/' + jobSaveRes.body._id)
							.send(job)
							.expect(200)
							.end(function(jobUpdateErr, jobUpdateRes) {
								// Handle Job update error
								if (jobUpdateErr) done(jobUpdateErr);

								// Set assertions
								(jobUpdateRes.body._id).should.equal(jobSaveRes.body._id);
								(jobUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Jobs if not signed in', function(done) {
		// Create new Job model instance
		var jobObj = new Job(job);

		// Save the Job
		jobObj.save(function() {
			// Request Jobs
			request(app).get('/jobs')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Job if not signed in', function(done) {
		// Create new Job model instance
		var jobObj = new Job(job);

		// Save the Job
		jobObj.save(function() {
			request(app).get('/jobs/' + jobObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);
					res.body[0].should.be.an.Object.with.property('name', job.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Job instance if signed in as admin', function(done) {
		agent.post('/auth/signin')
			.send(acred)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Save a new Job
				agent.post('/jobs')
					.send(job)
					.expect(200)
					.end(function(jobSaveErr, jobSaveRes) {
						// Handle Job save error
						if (jobSaveErr) done(jobSaveErr);

						// Delete existing Job
						agent.delete('/jobs/' + jobSaveRes.body._id)
							.send(job)
							.expect(200)
							.end(function(jobDeleteErr, jobDeleteRes) {
								// Handle Job error error
								if (jobDeleteErr) done(jobDeleteErr);

								// Set assertions
								(jobDeleteRes.body._id).should.equal(jobSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Job instance if signed in as user', function(done) {
		// Create new Job model instance
		var jobObj = new Job(job);

		// Save the job
		jobObj.save(function() {
			agent.post('/auth/signin')
				.send(ucred)
				.expect(200)
				.end(function(signinErr, signinRes) {
					// Handle signin error
					if (signinErr) done(signinErr);

					// Delete existing Job
					agent.delete('/jobs/' + jobObj._id)
						.send(job)
						.expect(403)
						.end(function(jobDeleteErr, jobDeleteRes) {
							// Set assertions
							(jobDeleteRes.text).should.match('User is not authorized');

							// Call the assertion callback
							done(jobDeleteErr);
						});
				});
		});
	});

	it('should not be able to delete Job instance if not signed in', function(done) {
		// Set Job user 
		job.user = user;

		// Create new Job model instance
		var jobObj = new Job(job);

		// Save the Job
		jobObj.save(function() {
			// Try deleting Job
			request(app).delete('/jobs/' + jobObj._id)
			.expect(401)
			.end(function(jobDeleteErr, jobDeleteRes) {
				// Set message assertion
				(jobDeleteRes.body.message).should.match('User is not logged in');

				// Handle Job error error
				done(jobDeleteErr);
			});

		});
	});

	it('should populate parent job with name and tier', function(done) {
		var jobObj, subJobObj;

		jobObj = new Job(job);
		jobObj.save(function() {
			subJobObj = new Job({
				name: 'Sub Job',
				parent: jobObj
			});
			subJobObj.save(function() {
				request(app).get('/jobs/' + subJobObj._id)
				.expect(200)
				.end(function(getErr, getRes) {
					(getRes.body[0].parent).should.be.an.Object.with.property('_id', jobObj._id.toString());
					(getRes.body[0].parent).should.have.property('tier', 0);
					done();
				});
			});
		});
	});

	it('should return all parent jobs in tier order if requested with qs parameter full', function(done) {
		var jobObj, subJobObj;

		jobObj = new Job(job);
		jobObj.save(function() {
			subJobObj = new Job({
				name: 'Sub Job',
				parent: jobObj
			});
			subJobObj.save(function() {
				request(app).get('/jobs/' + subJobObj._id + '?full=1')
				.expect(200)
				.end(function(getErr, getRes) {
					getRes.body.should.be.an.Array.with.length(2);
					getRes.body[0].should.be.an.Object.with.property('_id', jobObj._id.toString());
					getRes.body[1].should.be.an.Object.with.property('_id', subJobObj._id.toString());
					done();
				});
			});
		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Job.remove().exec();
		done();
	});
});