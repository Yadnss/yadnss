'use strict';

(function() {
	// Jobs Controller Spec
	describe('Skill Simulator Controller Tests', function() {
		// Initialize global variables
		var SkillSimulatorController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Jobs controller.
			SkillSimulatorController = $controller('SkillSimulatorController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Job and its skills from XHR', inject(['Jobs', 'Skills', function(Jobs, Skills) {
			// Create sample Job using the Jobs service
			var sampleJob1 = new Jobs({ _id: '525a8422f6d0f87f0e407a33' }),
				sampleJob2 = new Jobs({ _id: '525a8422f6d0f87f0e407a34' }),
				sampleSkill = new Skills({ _id: '525a8422f6d0f87f0e407a35'}),
				sampleJobs = [sampleJob1, sampleJob2],
				sampleSkills = [sampleSkill];

			// Set the URL parameter
			$stateParams.jobId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET('jobs/525a8422f6d0f87f0e407a33?full=1').respond(sampleJobs);
			$httpBackend.expectGET('skills?jobIds=525a8422f6d0f87f0e407a33%3B525a8422f6d0f87f0e407a34%3B').respond(sampleSkills);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.jobs).toEqualData(sampleJobs);
			expect(scope.skills).toEqualData(sampleSkills);
		}]));

	});
}());