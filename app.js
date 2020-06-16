const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const notFoundRoute = require('./routes/not-found');

app.use(bodyParser.urlencoded({
    extended: false,
}));

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(notFoundRoute);

app.listen(666);