'use strict';

// Jobs controller
angular.module('skillSimulator').controller('SkillSimulatorController', ['$scope', '$stateParams', 'Jobs', 'Skills',
	function($scope, $stateParams, Jobs, Skills) {

		$scope.find = function() {
			$scope.jobs = Jobs.getFull({ jobId: $stateParams.jobId }, function(jobs) {
				var idTemplate = '<% _.forEach(jobs, function(job) { %><%- job._id %>;<% }); %>',
					jobIds = _.template(idTemplate, {jobs: jobs});
				$scope.skills = Skills.get({ jobIds: jobIds });
			});
		};
	}
]);