'use strict';

//Setting up route
angular.module('skillSimulator').config(['$stateProvider',
	function($stateProvider) {
		// Jobs state routing
		$stateProvider.
		state('simulator', {
			url: '/simulator/:jobId',
			templateUrl: 'modules/skillSimulator/views/simulator.client.view.html'
		});
	}
]);