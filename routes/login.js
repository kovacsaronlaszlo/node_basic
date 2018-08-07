var express = require('express'),
    router = express.Router(),
    DB = require('../module/DB'),
    Auth = require('../module/auth');

router.get('/', (req, res, next) => {
    res.render('login', {title: 'Belépés'})
});

/**
 * post kérés a beléptetéshez
 */
router.post('/', (req, res, next) => {
    let credentials = {email: req.body.email, password: req.body.password};
    let users = new DB('users');
    users.findOne(credentials)
        .then(user => {
            if (user) {
                delete user.password;
                Auth.setCookies(req, res, user)
                    .redirect('/');
            } else {
                res.render('login', {title: 'Belépés', fail: true});
            }
        });
});

module.exports = router;