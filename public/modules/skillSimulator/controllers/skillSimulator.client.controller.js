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
				$scope.build.job = _.last(jobs)._id;
				$scope.skills = Skills.get({ jobIds: jobIds });
			});
		};
	}
]);