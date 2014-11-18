'use strict';

//Jobs service used to communicate Jobs REST endpoints
angular.module('jobs').factory('Jobs', ['$resource',
	function($resource) {
		return $resource('jobs/:jobId', { jobId: '@_id'
		}, {
			get: { method: 'GET', isArray: true },
			update: { method: 'PUT' }
		});
	}
]);