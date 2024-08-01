/*****************************************
* Description: The main entrypoint for the ScholarEats application
*****************************************/

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv').config();
const flash = require('connect-flash');

const inventoryRoutes = require('./routes/inventoryRoutes_BE');              // Inventory
const userRoutes = require('./routes/userRoutes_BE');                        // User
const recipeRoutes = require('./routes/recipeRoutes_BE');                    // Recipe
const about = require('./routes/about');                                     // About
const autocomplete = require('./routes/autocomplete');
const notificationRoutes = require('./routes/notificationRoutes_BE');                   // Landing Page
const adminTools = require('./routes/adminToolsRoutes/adminTools');
const { IS_LOGGED_IN, IS_ADMIN, IS_USER, IS_LOGGED_OUT } = require('./routes/APIRequestAuthentication_BE');

const app = express();

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // for form data

const connection = require('./routes/db');

const sessionStore = new MySQLStore({}, connection);

app.use(session({
  key: 'cookie_id',
  secret: 'secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.user ? true : false;
  if (res.locals.isLoggedIn) {
    res.locals.isAdmin = req.session.user.role === 'admin';
  } else {
    res.locals.isAdmin = false;
  }
  //console.log('isLoggedIn:' + res.locals.isLoggedIn);
  //console.log('isAdmin:' + res.locals.isAdmin);
  next();
});

// Mount routes
app.use("/recipes", recipeRoutes); // Recipe Routes
app.use("/ingredients", inventoryRoutes); // Inventory Routes
app.use("/users", userRoutes); // User Routes
app.use("/about", about);
app.use("/suggestions", autocomplete);
app.use("/notifications", notificationRoutes);
app.use("/admin-tools", adminTools);


// Middleware to configure Handlebars
const hbs = exphbs.create({
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  defaultLayout: 'defaultLayout',
  extname: 'hbs',
});

app.engine('hbs', hbs.engine);

app.set('view engine', 'hbs');

//Middleware Functions to parse json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());

function debugMsg(input) { // Use this for debug messages, I got tired of doing a ton of if (debug) statements
  if (debug) {
    console.log(input);
  }
}

//this piece of code is to pass the dropdown variables between routes
app.locals.dropdownFilters = {
  value: 'Filter', id: 'filter_options',
  checkbox_option: ['Vegan', 'Gluten Free', 'Oven Required', 'Stove Required', 'Easy', 'Medium', 'Hard'],
  radio_option: ['Calories Ascending', 'Calories Descending', 'Protein Ascending', 'Protein Descending', 'Fat Ascending', 'Fat Descending', 'Fiber Ascending', 'Fiber Descending']
};

app.locals.dietaryRestrictions = {
  value: 'Dietary Restrictions', id: 'dietary_restrictions',
  checkbox_option: ['Vegan', 'Keto', 'Hala', 'Vegetarian', 'Pescatarian', 'Kosher']
};

app.locals.allergies = {
  value: 'Allergies', id: 'allergies',
  checkbox_option: ['Milk', 'Eggs', 'Fish', 'Crustacean Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans']
};

// Rendering recipes dynamically from the database
app.get('/', async (req, res) => {


  // const darkmode = req.session.user_info.modes == 'darkmode' ? 1 : 0;

  // console.log(darkmode);

  // Recipes
  const recipeQuery = `
        SELECT DISTINCT r.*
        FROM recipes r
        WHERE r.recipe_id IN (
        SELECT MIN(inner_r.recipe_id)
        FROM recipes inner_r
        GROUP BY inner_r.recipe_name
        )
        AND NOT EXISTS (
            SELECT 1
            FROM recipe_ingredient ri
            WHERE ri.recipe_id = r.recipe_id
            AND ri.ingredient_id NOT IN (
                SELECT ingredient_id
                FROM store
                WHERE quantity > 0
            )
        )
        ORDER BY r.recipe_name DESC
        LIMIT 3
    `;

	// Ingredients
	let ingredientsQuery = `
        SELECT i.name, i.img_src
        FROM ingredient i
		ORDER BY RAND()
        LIMIT 3
    `;

	let isLoggedIn = false;
	let userId = -1;

	try {
		userId = req.session.user.userId;
		console.log(`User ID: ${userId}`);

		if (req.session.user) {
			isLoggedIn = true;
			ingredientsQuery = `
				SELECT s.*, i.*
				FROM store s
				JOIN ingredient i ON s.ingredient_id = i.ingredient_id
				JOIN university u ON s.university_id = u.university_id
				JOIN users usrs ON usrs.university = u.name
				WHERE usrs.user_id = ?
			`;
			console.log(`User is LOGGED IN`);
		}
	} catch (err) {
		console.error(err, 'User is logged out 152');
	}

	try {
		const [recipeResults] = await connection.execute(recipeQuery);
		let ingredientsResults = [];

		if (isLoggedIn) {
			[ingredientsResults] = await connection.execute(ingredientsQuery, [userId]);
		} else {
			[ingredientsResults] = await connection.execute(ingredientsQuery);
		}

		res.render('landingpage', {
			style: ['default.css', 'landingpage.css'],
			script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
			dropdown1: app.locals.dropdownFilters,
			recipes: recipeResults,
			ingredients: ingredientsResults,
			title: 'Landing Page'
		});
	} catch (err) {
		console.error(err, 'Error fetching ingredients');
		return res.status(500).send('Error fetching ingredients');
	}
});

// Add more routes here as needed
app.route('/about')
  .get(async (req, res) => {
    const userId = req.session.user.userId;

    var styles = ['default.css'];

    const query = `
    SELECT ui.modes
    FROM user_info ui
    JOIN users u ON ui.user_id
    = u.user_id
    WHERE u.user_id = ?`;

    try {
      const [results] = await connection.execute(query, [userId]);
      if (results.length > 0 && results[0].modes == 'darkmode') {
        styles.push('darkmode.css');
      }
    } catch (err) {
      console.error('Error fetching mode:', err);
      return res.status(500).send('Error fetching mode');
    }

    //console.log(mode);

    res.render('index', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      style: styles,
      dropdown1: app.locals.dropdownFilters,
      title: 'Team\'s about page',
      header: 'Team\'s about page'
    })
  });

// serve login page
app.route('/login')
  .get((req, res) => {
    res.render('login', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      style: ['default.css', 'login.css'],
      dropdown1: app.locals.dropdownFilters,
      title: 'Login'
    })
  });

// serve login page
app.route('/adminlogin')
  .get((req, res) => {
    res.render('adminlogin', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
      style: ['default.css', 'login.css'],
      dropdown1: app.locals.dropdownFilters,
      title: 'Admin Login',
      mode: 'login'
    })
  });


// serve forgot password page
app.get('/forgotpassword', (req, res) => {
  res.render('forgotpassword', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'forgotpassword.css'],
    dropdown1: app.locals.dropdownFilters,
    title: 'Forgot Password'
  });
});

// serve privacy policy page
app.get('/privacy_policy', (req, res) => {
  res.render('privacy_policy', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css'],
    dropdown1: app.locals.dropdownFilters,
    title: 'Privacy Policy'
  });
});

// serve terms of service page
app.get('/termsofservice', (req, res) => {
  res.render('termsofservice', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css'],
    dropdown1: app.locals.dropdownFilters,
    title: 'Terms of Service'
  });
});

// serve contact us page
app.get('/contact_us', (req, res) => {
  const teamMembers = [
    { name: 'Angelo Arriaga', src: 'images/angelo.jpg', alt: 'angelo.jpg', role: 'Team Lead', email: 'aarriaga1@sfsu.edu' },
    { name: 'Donovan Taylor', src: 'images/donovan.jpg', alt: 'donovan.jpg', role: 'Frontend Lead', email: 'dvelasquez1@sfsu.edu' },
    { name: 'Hancun Guo', src: 'images/hancun.jpg', alt: 'hancun.jpg', role: 'Frontend', email: 'hguo4@sfsu.edu' },
    { name: 'Edward Mcdonald', src: 'images/edward.jpg', alt: 'edward.jpg', role: 'Backend Lead', email: 'emcdonald1@sfsu.edu' },
    { name: 'Karl Carsola', src: 'images/karl.jpg', alt: 'karl.jpg', role: 'Backend', email: 'kcarsola@mail.sfsu.edu' },
    { name: 'Sai Bavisetti', src: 'images/sai.jpg', alt: 'sai.jpg', role: 'Database', email: 'sbavisetti@sfsu.edu' },
    { name: 'Maeve Fitzpatrick', src: 'images/maeve.jpg', alt: 'maeve.jpg', role: 'Docs-Editor', email: 'mfitzpatrick@sfsu.edu' },
    { name: 'Sabrina Diaz-Erazo', src: 'images/sabrina.jpg', alt: 'sabrina.jpg', role: 'GitHub Master', email: 'sdiazerazo@sfsu.edu' },
    { name: 'Tina Chou', role: 'Frontend', src: 'images/tina.jpg', alt: 'tina.jpg', email: 'ychou@sfsu.edu' }
  ];
  // add styling to contact_us page
  res.render('contact_us', {
    style: ['default.css'],
    dropdown1: app.locals.dropdownFilters,
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    teamMembers,
    title: 'Contact Us'
  });
});

// serve registration page
app.get('/register', (req, res) => {
  res.render('register', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'register.css'],
    dropdown1: app.locals.dropdownFilters,
    title: 'Register'
  });
});

// add dark mode button here
app.get('/accountmanagement', (req, res) => {

  const styles = ['default.css', 'accountmanagement.css']



  res.render('accountManagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
    style: styles,
    dropdown1: app.locals.dropdownFilters,
    dropdown2: app.locals.dietaryRestrictions,
    dropdown3: app.locals.allergies,
    title: 'Account Management'
  });
});

// 404 Error handling
app.use((req, res, next) => {
  res.status(404).send('404 Page Not Found');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
