var express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {
    res.render('login', {title: 'Belépés'})
});

module.exports = router;