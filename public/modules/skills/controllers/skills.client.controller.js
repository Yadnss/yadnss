'use strict';

// Skills controller
angular.module('skills').controller('SkillsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Skills', 'Jobs',
	function($scope, $stateParams, $location, Authentication, Skills, Jobs) {
		$scope.authentication = Authentication;

		// Required params for create skill view
		$scope.required_skills = [];
		$scope.required_sp = [0, 0, 0];

		// Create new Skill
		$scope.create = function() {
			// Create new Skill object
			var skill = new Skills ({
				name: this.name,
				job: this.job,
				description: this.description,
				required_skills: _.map(this.required_skills, $scope.mapSkill),
				required_sp: this.required_sp,
				icon_index: this.icon_index,
				tree_index: this.tree_index,
				ultimate: this.ultimate
			});

			// Redirect after save
			skill.$save(function(response) {
				$location.path('skills/' + response._id);

				// Clear form fields
				$scope.name = '';
				$scope.required_skills = [];
				$scope.required_sp = [0, 0, 0];
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Skill
		$scope.remove = function(skill) {
			if ( skill ) { 
				skill.$remove();

				for (var i in $scope.skills) {
					if ($scope.skills [i] === skill) {
						$scope.skills.splice(i, 1);
					}
				}
			} else {
				$scope.skill.$remove(function() {
					$location.path('skills');
				});
			}
		};

		// Update existing Skill
		$scope.update = function() {
			var skill = $scope.skill;

			// reduce referenced objects to their ids
			skill.job = skill.job._id;
			skill.required_skills = _.map(skill.required_skills, $scope.mapSkill);

			skill.$update(function() {
				$location.path('skills/' + skill._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Add blank required skill
		$scope.addRequisite = function(required_skills) {
			required_skills.push({
				skill: { _id: null },
				level: 1
			});
		};

		// Remove a required skill
		$scope.removeRequisite = function(reqs, req) {
			_.pull(reqs, req);
		};

		// Reduce requisite skills to their ids
		$scope.mapSkill = function(req) {
			return { skill: req.skill._id, level: req.level };
		};

		// Find a list of Jobs
		$scope.findJobs = function() {
			$scope.jobs = Jobs.query();
		};

		// Find a list of Skills
		$scope.find = function() {
			$scope.skills = Skills.query();
		};

		// Find existing Skill and related job
		$scope.findOne = function() {
			Skills.get({ skillId: $stateParams.skillId }, function(data) {
				$scope.skill = _.first(data);
			});
		};

		// Check for permissions
		$scope.hasPermission = function() {
			return _.indexOf($scope.authentication.user.roles, 'admin') > -1;
		};
	}
]);