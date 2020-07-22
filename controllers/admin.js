const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    })
};

exports.postAddProduct = (req, res) => {
    const { title, price, description, imageUrl } = req.body;

    new Product(title, price, description, imageUrl).save().then(() => {
        console.log('Created Product');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
};

// exports.getEditProduct = (req, res, next) => {
//     const editMode = req.query.edit;
//     if (!editMode) {
//         return res.redirect('/');
//     }
//     const prodId = req.params.productId;
//     req.user.getProducts({
//         where: {
//             id: prodId
//         }
//     }).then(products => {
//         if (!products) {
//             return res.redirect('/');
//         }
//         res.render('admin/edit-product', {
//             pageTitle: 'Edit Product',
//             path: '/admin/edit-product',
//             editing: editMode,
//             product: products[0].dataValues
//         })
//     })
// };

exports.postEditProduct = (req, res, next) => {
    const { productId, title, imageUrl, price, description } = req.body;

    Product.update({
        title,
        imageUrl,
        price,
        description
    }, {
        where: {
            id: productId
        }
    }).then(() => {
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
};

exports.postDeleteProduct = (req, res) => {
    const { productId } = req.params;
    Product.findByPk(productId).then(product => {
        return product.destroy();
    }).then(() => {
        console.log('PRODUCT DESTROYED');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
}

exports.getProducts = (req, res, next) => {
    req.user.getProducts().then(products => {
        res.render('admin/products', {
            path: '/admin/products',
            pageTitle: 'Admin Products',
            prods: products
        })
    }).catch(err => console.log(err));
};