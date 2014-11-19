'use strict';

angular.module('skillSimulator').directive('ydSkill', [
	function() {
		var link = function(scope, elem, attr) {
			// Calculate icon image positioning
			var index = scope.sicon.skill.icon_index,
				x = -50 * ((index % 100) % 10),
				y = -50 * (Math.floor((index % 100) / 10)),
				margin = _.template('<%= y %>px 0 0 <%= x %>px', {x: x, y: y});

			elem.find('img').css('margin', margin);

			// Calculate relative position in skill-grid
			index = scope.sicon.skill.tree_index;
			x = (3 - index % 4) * 66 + 8;
			y = Math.floor(index / 4) * 74 + 12;
			elem.find('.skill-icon').css({'top': y + 'px', 'right': x + 'px'});
		};

		return {
			link: link,
			restrict: 'E',
			scope: {
				sicon: '=sicon',
				baseJob: '=baseJob'
			},
			templateUrl: 'modules/skillSimulator/views/ydSkill.client.view.html'
		};
	}
]);