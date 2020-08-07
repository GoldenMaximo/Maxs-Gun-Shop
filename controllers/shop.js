const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
            isAuthenticated: req.isAuthenticated
        });
    }).catch(err =>
        console.log(err)
    );
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then((product) => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products',
            isAuthenticated: req.isAuthenticated
        })
    }).catch(err => console.log(err));
}

exports.getIndex = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            isAuthenticated: req.isAuthenticated
        });
    }).catch(err => {
        console.log(err);
    });
};

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate().then(user => {
        res.render('shop/cart', {
            pageTitle: 'Your Cart',
            path: '/cart',
            products: user.cart.items.map(product => { return { ...product.productId._doc, quantity: product.quantity } }),
            isAuthenticated: req.isAuthenticated
        });
    })
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId).then(product => {
        return req.user.addToCart(product);
    }).then(result => {
        res.redirect('/cart');
    }).catch(err => console.log(err));
}

exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    req.user.removeFromCart(prodId).then(result => {
        console.log('Product removed from Cart');
        res.redirect('/cart');
    }).catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id}).then(orders => {
        res.render('shop/orders', {
            pageTitle: 'Your orders',
            path: '/orders',
            orders,
            isAuthenticated: req.isAuthenticated
        });
    }).catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate().then(user => {
        const products = user.cart.items.map(i => {
            return { quantity: i.quantity, product: { ...i.productId._doc } }
        });
        console.log("we'll see: ", products);
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            products
        });
        order.save();
    }).then(() => {
        console.log('Created order');
        return req.user.clearCart();
    }).then(() => {
        console.log('Cleared cart');
        res.redirect('/orders');
    }).catch(err => console.log(err));
}