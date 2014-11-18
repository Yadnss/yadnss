'use strict';

/**
 * Module dependencies.
 */
require('../app/models/job.server.model.js');
var init = require('../config/init')(),
	config = require('../config/config'),
	mongoose = require('mongoose'),
	fs = require('fs'),
	im = require('gm').subClass({ imageMagick: true }),
	_ = require('lodash'),
	path = require('path'),
	Job = mongoose.model('Job');

// Bootstrap db connection
mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

var iconCfg = {
	// Folder dds files are extracted
	inputDir: path.join('.', 'extract'),

	// Folder to write converted images
	outputDir: path.join('..', 'public', 'modules', 'skillSimulator', 'img'),

	// Per job config options
	jobs: {
		'Archer': {
			iconFile: 'skillicon02',
			alphaFix: false
		},
		'Assassin': {
			iconFile: 'skillicon10',
			alphaFix: true
		},
		'Cleric': {
			iconFile: 'skillicon04',
			alphaFix: false
		},
		'Kali': {
			iconFile: 'skillicon09',
			alphaFix: true
		},
		'Lancea': {
			iconFile: 'skillicon11',
			alphaFix: true
		},
		'Sorceress': {
			iconFile: 'skillicon03',
			alphaFix: false
		},
		'Tinkerer': {
			iconFile: 'skillicon08',
			alphaFix: true
		},
		'Warrior': {
			iconFile: 'skillicon01',
			alphaFix: false
		}
	}
};

// Make directories
var mkdir = function(path) {
	try {
		fs.mkdirSync(path);
	} catch(err) {
		if (err.code !== 'EEXIST') { throw err; }
	}
};
var unlink = function(path) {
	try {
		fs.unlinkSync(path);
	} catch(err) {
		if (err.code !== 'ENOENT') { throw err; }
	}
};
mkdir(iconCfg.outputDir);
mkdir(path.join(iconCfg.outputDir, 'hi'));
mkdir(path.join(iconCfg.outputDir, 'lo'));

// Function to convert dds icons to png format and fix alpha if needed
var processJob = function(jobCfg, jobName, jobs) {
	var job = _.find(jobs, function(j) { return j.name == jobName; });
	if (!job) { return; }

	// Process hi color icons
	var infile = path.join(iconCfg.inputDir, jobCfg.iconFile),
		outfile = path.join(iconCfg.outputDir, 'hi', job._id + '.png'),
		img;
	unlink(outfile);
	im(infile + '.dds').write(outfile, function(err) { if (err) {throw err;} });

	// Process lo color icons
	infile = path.join(iconCfg.inputDir, jobCfg.iconFile);
	outfile = path.join(iconCfg.outputDir, 'lo', job._id + '.png');
	unlink(outfile);

	img = im(infile + '_b.dds');
	if (jobCfg.alphaFix) { img.channel('Alpha').out('-evaluate', 'Divide', 2); }
	img.write(outfile, function(err) { if (err) {throw err;} });
};

Job.find({}, function(err, jobs) {
	mongoose.disconnect();
	_.forEach(iconCfg.jobs, function(jobCfg, jobName) {
		processJob(jobCfg, jobName, jobs);
	});
});
