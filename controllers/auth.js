exports.getLogin = (req, res, next) => {
    // this is horrible and not scalable, jesus max wtf man
    const isLoggedIn = req.get('Cookie').split('=')[0];
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    res.cookie('loggedIn=true');
    res.redirect('/');
};