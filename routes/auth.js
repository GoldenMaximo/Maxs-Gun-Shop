const express = require('express');
const { check, body } = require('express-validator/check');
const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid email or password'),
    body('password', 'Invalid email or password').isAlphanumeric().isLength({ min: 8 })
], authController.postLogin);

router.post(
    '/signup',
    [
        check('email').isEmail().withMessage('Please enter a valid email').custom((value, { req }) => {
            // If express validator indentifies a promise it waits until the promise is done
            // If the promise returns something or nothing it passes the validation
            // If the promise fails it fails the validation
            return User.findOne({
                email: value
            }).then(user => {
                if (user) {
                    return Promise.reject('This email is already in use');
                }
            });
        }),
        body('password', 'Please enter a password with only numbers and text and at least 8 characters').isLength({ min: 8 }).isAlphanumeric(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!')
            }
            return true;
        }),
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;