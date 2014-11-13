'use strict';

// Configuring the Articles module
angular.module('skills').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Skills', 'skills', 'dropdown', '/skills(/create)?', false, ['admin']);
		Menus.addSubMenuItem('topbar', 'skills', 'List Skills', 'skills');
		Menus.addSubMenuItem('topbar', 'skills', 'New Skill', 'skills/create');
	}
]);