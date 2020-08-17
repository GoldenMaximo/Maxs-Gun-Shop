require('dotenv').config();

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.NODEMAILER_API_KEY
    }
}))

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: req.flash('error')[0]
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: req.flash('error')[0]
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    // Mock user
    User.findOne({ email }).then(user => {
        if (!user) {
            req.flash('error', 'Invalid email or password.');
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
            req.flash('error', 'Invalid email or password.');
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
            req.flash('error', 'Email already in use.');
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
            return transporter.sendMail({
                to: email,
                from: 'gfmaximo97@gmail.com', // GoldenMaximo's business email
                subject: 'Signup successful',
                html: '<h1>You successefully signed up!</h1>'
            });
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: req.flash('error')[0]
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email}).then(user => {
            if (!user) {
                req.flash('error', 'No account with that email was found');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000
            return user.save();
        }).then(result => {
            res.redirect('/');
            return transporter.sendMail({
                to: req.body.email,
                from: 'gfmaximo97@gmail.com', // GoldenMaximo's business email
                subject: 'Password reset',
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                `
            });
        }).catch(err => console.log(err));
    })
}