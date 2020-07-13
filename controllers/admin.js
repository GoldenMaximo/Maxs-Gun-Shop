const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    })
};

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;

    Product.create({
        title,
        price,
        imageUrl,
        description
    }).then(() => {
        console.log('Created Product');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findByPk(prodId).then(result => {
        if (!result) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: result.dataValues
        })
    })
};

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
    Product.findAll().then(products => {
        res.render('admin/products', {
            path: '/admin/products',
            pageTitle: 'Admin Products',
            prods: products
        })
    }).catch(err => console.log(err));
};