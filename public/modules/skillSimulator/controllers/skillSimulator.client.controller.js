'use strict';

// Jobs controller
angular.module('skillSimulator').controller('SkillSimulatorController', ['$scope', '$stateParams', 'Jobs', 'Skills',
	function($scope, $stateParams, Jobs, Skills) {
		$scope.build = {
			job: null,		/** Job build applies to */
			level: 70,		/** Character level */
			skills: [],		/** Array of {skill: skillId, level: level} */
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