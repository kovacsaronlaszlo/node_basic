var express = require('express');
var router = express.Router();
const DB = require('../module/DB'),
    professions = new DB('professions');

/* GET home page. */
router.get('/', function(req, res, next) {
  professions.getAll()
      .then(profs => {
          res.render('index', { title: 'Áron :)', profs: profs });
      });
});

module.exports = router;
