var express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {
    res.redirect('/');
});

router.get('/profession', function(req, res, next) {
    res.render('profession', {title: 'Szakmák'})
});

module.exports = router;