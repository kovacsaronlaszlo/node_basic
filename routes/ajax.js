var express = require('express'),
    router = express.Router(),
    DB = require('../module/DB'),
    salaries = new DB ('salaries'),
    professions = new DB('professions');


router.get('/', function(req, res, next) {
    res.json({error: 'Nem adott meg végpontot!'});
});

router.get('/professions', function(req, res, next) {
    professions.getAll()
        .then(profs => {
           res.json(profs);
        });
});

router.get('/salaries', function(req, res, next) {
    salaries.getAll()
        .then(sals => {
            res.json(sals);
        });
});

router.get('/salaries-for-profession/:id', function(req, res, next) {
    salaries.find({profession: req.params.id})
        .then(sals => {
            res.json(sals);
        });
});

module.exports = router;