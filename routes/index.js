var express = require('express');
var router = express.Router();
var migrator = require('../lib/migrator');
var vtexwriter = require('../lib/vtexwriter');

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/api/migrate', function(req, res){
  console.log('migration started');
  migrator.startMigration();
  res.send('Migration started');
  vtexwriter.startVtexWrite();
});

module.exports = router;
