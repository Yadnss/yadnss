'use strict';

angular.module('builds').directive('ydSkill', [
	function() {
		var link = function(scope, elem, attr) {
			var index, x, y, margin;

			// Calculate icon image positioning
			index = scope.sicon.skill.icon_index;
			x = -50 * ((index % 100) % 10);
			y = -50 * (Math.floor((index % 100) / 10));
			margin = _.template('<%= y %>px 0 0 <%= x %>px', {x: x, y: y});
			elem.find('img').css('margin', margin);

			// Calculate relative position in skill-grid
			index = scope.sicon.skill.tree_index;
			x = (3 - index % 4) * 66 + 8;
			y = Math.floor(index / 4) * 74 + 12;
			elem.find('.skill-icon').css({'top': y + 'px', 'right': x + 'px'});

			// tell skill-info panel to show this skill
			scope.setActive = function() {
				scope.build.active = scope.sicon;
				scope.$apply();
			};

			// increment skill level by n levels
			scope.increment = function(n) {
				var level = scope.sicon.level + n;
				level = _.max([-1, level]);
				level = _.min([level, scope.levels.length-1]);
				scope.sicon.level = level;
				scope.$apply();
			};

			// get available skill levels for current character level
			scope.getLevels = function() {
				scope.levels = _.filter(scope.sicon.skill.levels, function(level) {
					return level.character_level <= scope.build.level;
				});
			};

			// auto-update skill levels when build level is changed
			scope.$watch('build.level', function() {
				scope.getLevels();
			});

			// handlers for touch/click events
			scope.touchstart = {x: 0, y: 0};
			scope.touchend = {x: 0, y: 0};
			elem.find('img')
				// hide right-click menu
				.on('contextmenu', function() {return false;})

				.on('touchstart', function(event) {
					event.preventDefault();
					event.stopPropagation();
					scope.touchstart.x = event.originalEvent.touches[0].pageX;
					scope.touchstart.y = event.originalEvent.touches[0].pageY;
					scope.setActive();
					return false;
				})

				// Drag event, just keep track of where it is
				.on('touchmove', function(event) {
					scope.touchend.x = event.originalEvent.touches[0].pageX;
					scope.touchend.y = event.originalEvent.touches[0].pageY;
					return false;
				})

				.on('touchend', function(event) {
					var fact =2,
						dx = scope.touchend.x - scope.touchstart.x,
						dy = scope.touchend.y - scope.touchstart.y,
						adx = Math.abs(dx),
						ady = Math.abs(dy);

					if (adx > 30 && adx > fact*ady) {
						if (dx > 0) {
							scope.increment(1);
						} else {
							scope.decrement(-1);
						}
					} else if (ady > 30 && ady > fact*adx) {
						if (dy > 0) {
							scope.increment(-100);
						} else {
							scope.decrement(100);
						}
					}
					return false;
				})

				.on('mousedown', function(event) {
					event.preventDefault();
					event.stopPropagation();
					switch (event.which) {
						case 1:
							scope.increment((event.shiftKey || event.ctrlKey) ? 100 : 1);
							break;
						case 3:
							scope.increment((event.shiftKey || event.ctrlKey) ? -100 : -1);
							break;
						default:
							break;
					}
					return false;
				})

				.on('mouseover', function() {
					scope.setActive();
					return false;
				});
		};

		return {
			link: link,
			restrict: 'E',
			scope: {
				build: '=build', /** Information about current build */
				sicon: '=sicon', /** sicon model for this directive */
			},
			templateUrl: 'modules/builds/views/ydSkill.client.view.html'
		};
	}
]);