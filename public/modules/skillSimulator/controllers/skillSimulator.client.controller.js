'use strict';

// Jobs controller
angular.module('skillSimulator').controller('SkillSimulatorController', ['$scope', '$stateParams', 'Jobs', 'Skills',
	function($scope, $stateParams, Jobs, Skills) {
		$scope.build = {
			job: null,		/** Job build applies to */
			level: 70,		/** Character level */
			skills: [],		/** Array of {skill: skillId, level: level} */
		};
		$scope.pve = true;					/** switch to toggle pve/pvp info display */
		$scope.sp_total = 187;				/** Amount of SP available to spend */
		$scope.sp_limit = [116, 120, 116];	/** SP spending limit per tier */

		$scope.calc_sp_limit = function() {
			// SP spending limit per class, taken from jobtable.dnt
			var sp_level = [0.625, 0.644999980926514, 0.625],
				level = $scope.build.level;

			// 3 points per level until lvl 50, then 2 points per level
			$scope.sp_total = level > 50 ? level * 2 + 47 : level * 3 - 3;

			// SP limit is SP total if character is base job
			// otherwise distributed according to sp_level
			if ($scope.jobs.length === 1) {
				$scope.sp_limit = [$scope.sp_total, 0, 0];
			} else {
				_.forEach(_.range(3), function(n) {
					$scope.sp_limit[n] = Math.floor($scope.sp_total * sp_level[n]);
				});
			}
		};

		$scope.find = function() {
			$scope.jobs = Jobs.getFull({ jobId: $stateParams.jobId }, function(jobs) {
				var idTemplate = '<% _.forEach(jobs, function(job) { %><%- job._id %>;<% }); %>',
					jobIds = _.template(idTemplate, {jobs: jobs});

				// Save jobs in dictionary form for easy lookups later
				$scope.jobsById = _.reduce(jobs, function(result, job) {
						result[job._id] = job;
						return result;
					}, {});

				// Jobs are returned in ascending tier order
				// Job for the build is the last in the list
				$scope.build.job = _.last(jobs)._id;

				// Request skills related to the job
				Skills.get({ jobIds: jobIds }, function(skills) {
					// Make models for the skillicon directives
					$scope.sicons = _.map(skills, function(skill) {
						return { skill: skill,level: 0, active: false };
					});

					// Sort sicons by job then tree index
					$scope.sicons.sort(function(siconA, siconB) {
						var jobA = $scope.jobsById[siconA.skill.job._id],
							jobB = $scope.jobsById[siconB.skill.job._id];

						return jobA.tier === jobB.tier ?
							siconA.skill.tree_index - siconB.skill.tree_index :
							jobA.tier - jobB.tier;
					});

					// Save sicons in dictionary form for easy lookups
					$scope.siconsById = _.reduce($scope.sicons, function(result, sicon) {
						result[sicon.skill._id] = sicon;
						return result;
					}, {});
				});
			});
		};
	}
]);