'use strict';

// Menu service for generating dynamic simulator menu from Jobs in database
angular.module('builds').factory('BuildsMenu', ['Menus', 'Jobs',
	function(Menus, Jobs) {

		var makeMenu = function() {
			Jobs.query(function(jobs) {
				var baseJobs, t1Jobs, t2Jobs;

				// Find starting jobs
				baseJobs = _.filter(jobs, function(job) { return job.tier === 0; });

				_.forEach(baseJobs, function(baseJob) {
					// Make a menu item for each starting job
					Menus.addMenuItem('topbar', baseJob.name, baseJob.name, 'dropdown', '#');

					// Find their first specialization classes
					t1Jobs = _.filter(jobs, function(job) { return job.parent && job.parent._id === baseJob._id; });
					_.forEach(t1Jobs, function(t1Job, index) {
						// Add header menu items for first spec class
						if (index) {
							Menus.addSubMenuItem('topbar', baseJob.name, t1Job.name + 'divider', '#', null, null, null, null, 'divider');
						}
						Menus.addSubMenuItem('topbar', baseJob.name, t1Job.name, '#', null, null, null, null, 'dropdown-header');

						t2Jobs = _.filter(jobs, function(job) { return job.parent && job.parent._id === t1Job._id; });
						_.forEach(t2Jobs, function(t2Job) {
							Menus.addSubMenuItem('topbar', baseJob.name, t2Job.name, 'builds/create/' + t2Job._id);
						});
					});
				});
			});
		};

		return { makeMenu: makeMenu };
	}
]);