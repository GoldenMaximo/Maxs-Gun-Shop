const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    // Mock user
    User.findById('5f29ed379cafa817e007f3a8').then(user => {
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save((err) => {
            console.log(err);
            res.redirect('/');
        });
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
