'use strict';

angular.module('skillSimulator').directive('ydInfo', ['$sce',
	function($sce) {
		// formatting codes in description string to translate to html
		var codes = [
			{re: /\\n/g, val: '<br/>'},
			{re: /#w/g, val: '</span><span class="info-default">'},
			{re: /#y/g, val: '</span><span class="info-yellow">'},
		];

		var replaceCodes = function(result, code) {
			// callback for _.reduce to replace codes in description
			return result.replace(code.re, code.val);
		};

		var replaceParams = function(result, value, index) {
			// callback for _.reduce to replace params in description
			return result.replace(new RegExp('\\{' + index + '\\}', 'g'), value);
		};

		var formatDescription = function(skill, level, pve) {
			// Format a skill level's description
			var params, description, replacer;
			params = level.description_params[pve ? 'pve' : 'pvp'].split(',');

			description = _.reduce(codes, replaceCodes, skill.description);
			description = _.reduce(params, replaceParams, description);
			description = $sce.trustAsHtml('<span class="info-default">' + description + '</span>');

			return description;
		};

		var processSicon = function(scope) {
			// Process sicon object into scope variables for template
			if (!scope.sicon) { return; }

			scope.name = scope.sicon.skill.name;
			scope.level = scope.sicon.level + 1; // account for 0 indexing

			// lookup skill levels
			scope.curlvl = scope.sicon.skill.levels[scope.level];
			scope.nxtlvl = scope.sicon.skill.levels[scope.level+1];
			scope.curdesc_pve = scope.curlvl ? formatDescription(scope.sicon.skill, scope.curlvl, true) : null;
			scope.curdesc_pvp = scope.curlvl ? formatDescription(scope.sicon.skill, scope.curlvl, false) : null;
			scope.nxtdesc_pve = scope.nxtlvl ? formatDescription(scope.sicon.skill, scope.nxtlvl, true) : null;
			scope.nxtdesc_pvp = scope.nxtlvl ? formatDescription(scope.sicon.skill, scope.nxtlvl, false) : null;
		};

		var link = function(scope, elem, attrs) {
			// Attach info change handler
			scope.$watch('sicon', function(sicon) {
				processSicon(scope);
			});

			scope.$watch('sicon.level', function(sicon) {
				processSicon(scope);
			});
		};

		return {
			link: link,
			restrict: 'E',
			scope: {
				sicon: '=sicon',	/** sicon to display information for */
				pve: '=pve',		/** display pve or pvp information? */
			},
			templateUrl: 'modules/skillSimulator/views/ydInfo.client.view.html'
		};
	}
]);