const express = require('express');
const db = require('../db');
const router = express.Router();
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('../APIRequestAuthentication_BE');

async function checkAndMoveExpiredProducts() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Move expired products to expired_products table
    await connection.query(`
      INSERT INTO expired_products (ingredient_id, Name, expiration_date, quantity)
      SELECT ingredient_id, Name, expiration_date, quantity
      FROM store
      WHERE expiration_date < NOW()
    `);

    // Delete expired products from store table
    await connection.query(`
      DELETE FROM store
      WHERE expiration_date < NOW()
    `);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// Route to get all expired products
router.get('/', IS_ADMIN, async (req, res) => {
  try {
    //await checkAndMoveExpiredProducts();
    const [results] = await db.query('SELECT * FROM store WHERE expiration_date < CURDATE()');
    res.render('adminToolsViews/expiredProducts', { expiredProducts: results });
  } catch (err) {
    console.error('Error fetching expired products:', err);
    req.flash('error_msg', 'Error fetching expired products');
    res.redirect('/admin-tools/inventory-management');
  }
});

// Route to remove an expired product
router.post('/admin-tools/inventory-management/expired-products/delete', IS_ADMIN, async (req, res) => {
  const { ingredient_id } = req.body;

  const universityIdQuery = `
			SELECT u.university_id
			FROM users AS usrs
			JOIN university AS u
			ON usrs.university = u.name
			WHERE usrs.user_id = ?
		`;

    console.log(`name: ${universityIdQuery}`);

  try {
	  const [universityRow] = await connection.execute(universityIdQuery, [userId]);

	  const universityId = universityRow[0].university_id;


	  console.log(`Uni name: ${universityId}`);

    await db.query('DELETE FROM store WHERE ingredient_id = ? AND university_id = ?', [ingredient_id, universityId]);
    req.flash('success_msg', 'Product removed successfully');
    res.redirect('admin-tools/inventory-management/expired-products');
  } catch (err) {
    console.error('Error removing product:', err);
    req.flash('error_msg', 'Error removing product');
    res.redirect('/admin-tools/inventory-management/expired-products');
  }
});

module.exports = router;
