var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var dbmUtil = require('../../lib/util');

var rmdir = require('rimraf');


function wipeMigrations(callback) {
  var dir = path.join(__dirname, 'migrations');
  rmdir(dir, callback);
}

function dbMigrate() {
  var args = dbmUtil.toArray(arguments);
  var dbm = path.join(__dirname, '..', '..', 'bin', 'db-migrate');
  args.unshift(dbm);
  return cp.spawn('node', args, { cwd: __dirname });
}

vows.describe('create').addBatch({
  'without a migration directory': {
    topic: function() {
      wipeMigrations(function(err) {
        assert.isNull(err);
        dbMigrate('create', 'first migration').on('exit', this.callback);
      }.bind(this));
    },

    'does not cause an error': function(code) {
      assert.isNull(code);
    },

    'will create a new migration directory': function(code) {
      var stats = fs.statSync(path.join(__dirname, 'migrations'));
      assert.isTrue(stats.isDirectory());
    },

    'will create a new migration': function(code) {
      var files = fs.readdirSync(path.join(__dirname, 'migrations'));
      assert.equal(files.length, 1);
      var file = files[0];
      assert.match(file, /first-migration\.js$/);
    }
  }
}).addBatch({
  'with sql-file option set to true from config file' : {
    topic: function() {
      var configOption = path.join("--config=", __dirname, 'database_with_sql_file.json');
      wipeMigrations(function(err) {
        assert.isNull(err);
        dbMigrate( 'create', 'second migration', configOption).on('exit', this.callback);
      }.bind(this));
    },
    'does not cause an error': function(code) {
      assert.isNull(code);
    },
    'will create a new migration': function(code) {
      var files = fs.readdirSync(path.join(__dirname, 'migrations'));
      
      for (var i = 0; i<files.length; i++) {
        var file = files[i];
        var stats = fs.statSync(path.join(__dirname, 'migrations', file));
        if (stats.isFile()) assert.match(file, /second-migration\.js$/);
      }
    },
    'will create a new migration/sqls directory': function(code) {
      var stats = fs.statSync(path.join(__dirname, 'migrations/sqls'));
      assert.isTrue(stats.isDirectory());
    },
    'will create a new migration sql up file': function(code) {
      var files = fs.readdirSync(path.join(__dirname, 'migrations/sqls'));
      assert.equal(files.length, 2);
      var file = files[1];
      assert.match(file, /second-migration-up\.sql$/);
    }
  }
}).addBatch({
  'with sql-file option set to true as a command parameter' : {
    topic: function() {
      var configOption = path.join("--sql-file");
      wipeMigrations(function(err) {
        assert.isNull(err);
        dbMigrate( 'create', 'third migration', configOption).on('exit', this.callback);
      }.bind(this));
    },
    'does not cause an error': function(code) {
      assert.isNull(code);
    },
    'will create a new migration': function(code) {
      var files = fs.readdirSync(path.join(__dirname, 'migrations'));
      
      for (var i = 0; i<files.length; i++) {
        var file = files[i];
        var stats = fs.statSync(path.join(__dirname, 'migrations', file));
        if (stats.isFile()) assert.match(file, /third-migration\.js$/);
      }
    },
    'will create a new migration/sqls directory': function(code) {
      var stats = fs.statSync(path.join(__dirname, 'migrations/sqls'));
      assert.isTrue(stats.isDirectory());
    },
    'will create a new migration sql up file': function(code) {
      var files = fs.readdirSync(path.join(__dirname, 'migrations/sqls'));
      assert.equal(files.length, 2);
      var file = files[1];
      assert.match(file, /third-migration-up\.sql$/);
    }
  }
}).export(module);

