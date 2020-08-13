const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    // Mock user
    User.findOne({ email }).then(user => {
        if (!user) {
            return res.redirect('/login');
        }
        bcrypt.compare(password, user.password).then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                console.log('User logged in');
                return req.session.save((err) => {
                    console.log('session.save() error: ', err);
                    res.redirect('/');
                });
            }
            return res.redirect('/login');
        }).catch(err => {
            return res.redirect('/login');
        })
    }).catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    User.findOne({
        email
    }).then(user => {
        if (user) {
            return res.redirect('/signup');
        }
        return bcrypt.hash(password, 12).then(hashedPassword => {
            const newUser = new User({
                email,
                password: hashedPassword,
                cart: { items: [] }
            })
            return newUser.save();
        }).then(() => {
            res.redirect('/login');
        })
    }).catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
};
