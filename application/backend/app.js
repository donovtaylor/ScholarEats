const express = require('express');
const storeRoutes = require('./routes/store');
const expiredProductsRoutes = require('./routes/expiredProducts');

const app = express();
app.use(express.json());

// Use the routes
app.use('/store', storeRoutes);
app.use('/expired-products', expiredProductsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
