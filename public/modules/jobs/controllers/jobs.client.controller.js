'use strict';

// Jobs controller
angular.module('jobs').controller('JobsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Jobs',
	function($scope, $stateParams, $location, Authentication, Jobs) {
		$scope.authentication = Authentication;

		// Create new Job
		$scope.create = function() {
			// Create new Job object
			var job = new Jobs ({
				name: this.name,
				parent: this.parent
			});

			// Redirect after save
			job.$save(function(response) {
				$location.path('jobs/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Job
		$scope.remove = function(job) {
			if ( job ) { 
				job.$remove(function() {
					$location.path('jobs');
				});
			} else {
				$scope.job.$remove(function() {
					$location.path('jobs');
				});
			}
		};

		// Update existing Job
		$scope.update = function() {
			var job = $scope.job;

			job.$update(function() {
				$location.path('jobs/' + job._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Jobs
		$scope.find = function() {
			$scope.jobs = Jobs.query();
		};

		// Find existing Job
		$scope.findOne = function() {
			$scope.job = Jobs.get({ 
				jobId: $stateParams.jobId
			}, function() {
				$scope.parent = $scope.job.parent ?
								Jobs.get({ jobId: $scope.job.parent }) :
								null;
			});
		};

		// Check tier of job by id
		$scope.findTier = function(jobId) {
			var job = _.find($scope.jobs, {_id: jobId});
			return job ? job.tier : 0;
		};

		// Check for permissions
		$scope.hasPermission = function(user) {
			return _.indexOf(user.roles, 'admin') > -1;
		};
	}
]);