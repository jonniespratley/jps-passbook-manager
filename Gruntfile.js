'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	// configurable paths
	var yeomanConfig = {
		app: 'app',
		dist: 'dist'
	};

	try {
		yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
	} catch (e) {
	}

	grunt.initConfig({
		yeoman: yeomanConfig,
		watch: {
			coffee: {
				files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
				tasks: ['coffee:dist']
			},
			coffeeTest: {
				files: ['test/spec/{,*/}*.coffee'],
				tasks: ['coffee:test']
			},
			compass: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
				tasks: ['compass']
			},
			livereload: {
				files: [
					'<%= yeoman.app %>/{,*/}*.html',
					'<%= yeoman.app %>/views/{,*/}*.html',
					'{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
					'{.tmp,<%= yeoman.app %>}/scripts/{,**/}*.js',
					'<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg}'
				],
				tasks: ['livereload']
			}
		},
		connect: {
			livereload: {
				options: {
					port: 9005,
					// Change this to '0.0.0.0' to access the server from outside.
					open: true,
					debug: true,
					hostname: 'localhost',
					middleware: function (connect) {
						return [
							require('json-proxy').initialize({
				           proxy: {
				             forward: {
				               '/api/': 'http://localhost:1333',
									'/socket.io/': 'http://localhost:1333'
				             },
				             headers: {
				               'X-Forwarded-User': 'John Doe'
				             }
				           }
						  }),
							lrSnippet,
							mountFolder(connect, '.tmp'),
							mountFolder(connect, yeomanConfig.app)
						];
					}
				}
			},
			test: {
				options: {
					port: 9000,
					middleware: function (connect) {
						return [
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'test')
						];
					}
				}
			}
		},
		open: {
			server: {
				url: 'http://localhost:<%= connect.livereload.options.port %>'
			}
		},
		clean: {
			dist: ['.tmp', '<%= yeoman.dist %>/*'],
			server: '.tmp'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= yeoman.app %>/scripts/{,*/}*.js',
				'!<%= yeoman.app %>/scripts/vendor/{,*/}*.js'
			]
		},
		testacular: {
			unit: {
				configFile: 'testacular.conf.js',
				singleRun: true
			}
		},
		coffee: {
			dist: {
				files: {
					'.tmp/scripts/coffee.js': '<%= yeoman.app %>/scripts/*.coffee'
				}
			},
			test: {
				files: [{
					expand: true,
					cwd: '.tmp/spec',
					src: '*.coffee',
					dest: 'test/spec'
				}]
			}
		},
		compass: {
			dist: {}
		},
		concat: {
			dist: {
				files: {
					'<%= yeoman.dist %>/scripts/scripts.js': [
						'.tmp/scripts/*.js',
						'<%= yeoman.app %>/scripts/*.js'
					]
				}
			}
		},
		useminPrepare: {
			html: '<%= yeoman.app %>/index.html',
			options: {
				dest: '<%= yeoman.dist %>'
			}
		},
		usemin: {
			html: ['<%= yeoman.dist %>/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
			options: {
				dirs: ['<%= yeoman.dist %>']
			}
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		cssmin: {
			dist: {
				files: {
					'<%= yeoman.dist %>/styles/main.css': [
						'.tmp/styles/{,*/}*.css',
						'<%= yeoman.app %>/styles/{,*/}*.css'
					]
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					/*removeCommentsFromCDATA: true,
					 // https://github.com/yeoman/grunt-usemin/issues/44
					 //collapseWhitespace: true,
					 collapseBooleanAttributes: true,
					 removeAttributeQuotes: true,
					 removeRedundantAttributes: true,
					 useShortDoctype: true,
					 removeEmptyAttributes: true,
					 removeOptionalTags: true*/
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>',
					src: ['*.html', 'views/*.html'],
					dest: '<%= yeoman.dist %>'
				}]
			}
		},
		cdnify: {
			dist: {
				html: ['<%= yeoman.dist %>/*.html']
			}
		},
		ngmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.dist %>/scripts',
					src: '*.js',
					dest: '<%= yeoman.dist %>/scripts'
				}]
			}
		},
		uglify: {
			dist: {
				files: {
					'<%= yeoman.dist %>/scripts/scripts.js': [
						'<%= yeoman.dist %>/scripts/scripts.js'
					],
				}
			}
		},
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= yeoman.app %>',
					dest: '<%= yeoman.dist %>',
					src: [
						'*.{ico,txt}',
						'.htaccess',
						'bower_components/**/*'
					]
				}]
			}
		},
		nodeunit: {
			all: ['test/*-spec.js'],
			options: {
				reporter: 'verbose'
			}
		},
		// Configure a mochaTest task
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					quiet: false,
					clearRequireCache: false
				},
				src: ['test/routes/*-spec.js']
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		},
		mkdir: {
			all: {
				options: {
					mode: '0777',
					create: ['.tmp']
				}
			}
		},
		'saucelabs-mocha': {
			all: {
				options: {
					urls: ['passbook-manager.jsapps.io'],
					build: process.env.CI_BUILD_NUMBER,
					testname: 'Sauce Unit Test for passbook-manager.jsapps.io',
					browsers: [{
						browserName: 'chrome',
						version: '31',
						platform: 'XP'
					}]
				}
			}
		}
	});

	grunt.renameTask('regarde', 'watch');
	// remove when mincss task is renamed
	//grunt.renameTask('mincss', 'cssmin');

	grunt.registerTask('server', [
		'clean:server',
		//'coffee:dist',
		// 'compass:server',
		'livereload-start',
		'connect:livereload',
		'open',
		'watch'
	]);

	grunt.registerTask('test', [
		'clean:server',
		//  'jshint',
		'mkdir',
		'karma',
		'mochaTest'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		//  'jshint',
		'test',
		//  'coffee',
		//'compass:dist',
		'useminPrepare',
		//'imagemin',
		//'cssmin',
	//	'htmlmin',
		'concat',
		'copy',
//		'cdnify',
		'usemin',
		'ngmin',
		'uglify'
	]);

	grunt.registerTask('default', ['test', 'build']);
};
