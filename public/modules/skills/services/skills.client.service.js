'use strict';

//Skills service used to communicate Skills REST endpoints
angular.module('skills').factory('Skills', ['$resource',
	function($resource) {

		return $resource('skills/:skillId', { skillId: '@_id'
		}, {
			get: {
				method: 'GET',
				isArray: true
			},
			getFull: {
				method: 'GET',
				isArray: true,
				params: {'full': 1}
			},
			update: { method: 'PUT' }
		});
	}
]);