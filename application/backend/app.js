const express = require('express');
const storeRoutes = require('./routes/store');
const expiredProductsRoutes = require('./routes/expiredProducts');
const authenticationRoutes = require('./routes/authentication');
const blacklistRoutes = require('./routes/blacklist');
const usersRoutes = require('./routes/users');

const app = express();
app.use(express.json());

// Use the routes
app.use('/store', storeRoutes);
app.use('/expired-products', expiredProductsRoutes);
app.use('/auth', authenticationRoutes);
app.use('/blacklist', blacklistRoutes);
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
