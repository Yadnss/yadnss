'use strict';

/**
 * Module dependencies.
 */
var init = require('../config/init')(),
	config = require('../config/config'),
	mongoose = require('mongoose'),
	inquirer = require('inquirer');

// Bootstrap db connection
mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Load user model
require('../app/models/user.server.model.js')
var User = mongoose.model('User');

var validate_input = function(fieldname) {
	return function(input) {
		return input.length ? true : "Please supply your " + fieldname;
	};
};

inquirer.prompt([
	{
		type: "input",
		message: "Username",
		name: "username",
		validate: function(input) {
			var done = this.async();
			if (!input.length) {
				done("Please supply your username");
				return;
			}

			// Check for existing user
			User.count({username: input}, function (err, count) {
				if (err) {
					done("Error checking username availability, try again");
					return;
				} else if (count) {
					done("User with this name already exists");
					return;
				}
				done(true);
			});
		}
	}, {
		type: "password",
		message: "Password",
		name: "password",
		validate: function(input) {
			if (input.length < 7) {
				return "Passwords must be atleast 7 characters";
			}
			return true;
		}
	},{
		type: "confirm",
		message: "Admin",
		name: "admin",
		default: false,
	}, {
		type: "input",
		message: "Email",
		name: "email",
		validate: function(input) {
			if (input.match(/.+\@.+\..+/)) {
				return true;
			}
			return "Not a valid email address"
		}
	}, {
		type: "input",
		message: "First Name",
		name: "firstName",
		validate: validate_input("first name")
	}, {
		type: "input",
		message: "Last Name",
		name: "lastName",
		validate: validate_input("last name")
	}, {
		type: "input",
		message: "Display Name",
		name: "displayName"
	},
], function(res) {
	res.provider = 'local';
	res.roles = res.admin ? ['user', 'admin'] : ['user'];
	User(res).save(function(err, user) {
		if (err) console.log(err);
		mongoose.disconnect();
	});
});
