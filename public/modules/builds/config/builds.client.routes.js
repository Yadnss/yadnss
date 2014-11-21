'use strict';

//Setting up route
angular.module('builds').config(['$stateProvider',
	function($stateProvider) {
		// Jobs state routing
		$stateProvider.
		state('createBuild', {
			url: '/builds/create/:jobId',
			templateUrl: 'modules/builds/views/create-build.client.view.html'
		});
	}
]);