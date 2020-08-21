const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.getProducts = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
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
        })
    }).catch(err => console.log(err));
}

exports.getIndex = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
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
    Order.find({ "user.userId": req.user._id }).then(orders => {
        res.render('shop/orders', {
            pageTitle: 'Your orders',
            path: '/orders',
            orders,
        });
    }).catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate().then(user => {
        const products = user.cart.items.map(i => {
            return { quantity: i.quantity, product: { ...i.productId._doc } }
        });
        const order = new Order({
            user: {
                email: req.user.email,
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
};

exports.getInvoice = (req, res, next) => {
    const { orderId } = req.params;
    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('No order found.'));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized.'));
        }

        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join(`data/invoices/${invoiceName}`);
        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);

        pdfDoc.text('Hello world!');

        pdfDoc.end();


        // fs.readFile(invoicePath, (err, data) => {
        //     if (err) {
        //         console.log(err);
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type', 'application/pdf');
        //     res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
        //     res.send(data);
        // }).catch(err => next(err));
        // const file = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
        // file.pipe(res);
    });
};