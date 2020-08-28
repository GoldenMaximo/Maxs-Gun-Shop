require("dotenv").config(".env");
const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    }).then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    }).catch(err =>
        next(err)
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
    const page = +req.query.page || 1;
    let totalItems;

    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    }).then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    }).catch(err => {
        next(err);
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

exports.getCheckout = (req, res, next) => {
    let products;
    let totalSum = 0;
    req.user.populate('cart.items.productId').execPopulate().then(user => {
        products = user.cart.items;
        products.forEach(e => totalSum += e.quantity * e.productId.price);

        return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: products.map(e => {
                return {
                    name: e.productId.title,
                    description: e.productId.description,
                    amount: e.productId.price * 100,
                    currency: 'usd',
                    quantity: e.quantity
                    // price_data: {
                    //     currency: "usd",
                    //     product_data: {
                    //         name: e.productId.title,
                    //         description: e.productId.description,
                    //     },
                    //     unit_amount: e.productId.price * 100,
                    // },
                    // quantity: e.quantity,
                }
            }),
            success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
            cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
        });
    }).then(session => {
        res.render('shop/checkout', {
            pageTitle: 'Checkout',
            path: '/checkout',
            products,
            totalSum,
            sessionId: session.id
        });
    }).catch(err => {
        console.log('here boy: ', err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
    });
}

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

exports.getCheckoutSuccess = (req, res, next) => {
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

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true
        });

        pdfDoc.text('-----------------------------------------');
        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price;
            pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
        });
        pdfDoc.text('---');
        pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`);

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

// exports.postCreateCheckout = async (req, res) => {
//     // Set your secret key. Remember to switch to your live secret key in production.
//     // See your keys here: https://dashboard.stripe.com/account/apikeys

//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: [
//             {
//                 price_data: {
//                     currency: "usd",
//                     product_data: {
//                         name: "T-shirt",
//                     },
//                     unit_amount: 2000,
//                 },
//                 quantity: 1,
//             },
//         ],
//         mode: "payment",
//         success_url: "https://example.com/success",
//         cancel_url: "https://example.com/cancel",
//     });

//     res.json({ id: session.id });
// }