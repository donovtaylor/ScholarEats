const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const inventoryRoutes = require('./routes/inventoryRoutes_BE');              // Inventory
const userRoutes = require('./routes/userRoutes_BE');                        // User
const recipeRoutes = require('./routes/recipeRoutes_BE');                    // Recipe
const about = require('./routes/about');                                 // About
const autocomplete = require('./routes/autocomplete');

const app = express();

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // for form data

const connection = mysql.createPool({
  host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
  user: 'backend_Devop',
  password: 'password',
  database: 'ScholarEats'
});

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
  console.log('isAdmin:' + res.locals.isAdmin);
  next();
});

// Mount routes
app.use("/recipes", recipeRoutes); // Recipe Routes
app.use("/ingredients", inventoryRoutes); // Inventory Routes
app.use("/users", userRoutes); // User Routes
app.use("/about", about);
app.use("/suggestions", autocomplete);

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

//this piece of code is to pass the dropdown variables between routes
app.locals.dropdownFilters = {value: 'Filter', id: 'filter_options',
  checkbox_option: ['Vegan','Gluten Free','Oven Required','Stove Required','Easy','Medium','Hard','Medium','Hard'],
  radio_option: ['Calories Ascending','Calories Descending','Protein Ascending','Protein Descending','Fat Ascending','Fat Descending','Fiber Ascending','Fiber Descending']};

app.locals.dietaryRestrictions = {value: 'Dietary Restrictions', id: 'dietary_restrictions',
  checkbox_option: ['Vegan', 'Keto', 'Hala', 'Vegetarian', 'Pescatarian', 'Kosher']};

// Add more routes here as needed
app.route('/')
  .get((req, res) => {
    var searchInput = req.query.searchInput;
    res.render('index', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
      style: ['default.css'],
      dropdown1: app.locals.dropdownFilters,
      title: 'Team\'s about page',
      header: 'Team\'s about page',
      mode: 'default'
    })
  });

// serve login page
app.route('/login')
  .get((req, res) => {
    res.render('login', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
      style: ['default.css', 'login.css'],
      dropdown1: app.locals.dropdownFilters,
      title: 'Login',
      mode: 'login'
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
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
    style: ['default.css', 'forgotpassword.css'],
    dropdown1: app.locals.dropdownFilters,
    title: 'Forgot Password',
    mode: 'forgotpassword'
  });
});

// serve privacy policy and terms of service page
app.get('/privacy_policy', (req, res) => {
  res.render('privacy_policy', {
    script: ['mode.js'],
    style: ['default.css'],
    title: 'Privacy Policy and Terms of Service',
    mode: 'default'
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
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
    teamMembers,
    title: 'Contact Us',
    mode: 'default'
  });
});

app.use(express.static(path.join(__dirname, 'public')));
// serve registration page
app.get('/register', (req, res) => {
  res.render('register', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
    style: ['default.css'],
    dropdown1: app.locals.dropdownFilters,
    title: 'Register',
    mode: 'default'
  });
});

// test page to test new pages before connecting them
app.get('/test', (req, res) => {
  res.render('accountmanagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
    style: ['default.css', 'accountmanagement.css'],
    dropdown1: app.locals.dropdownFilters,
    title: 'Account Management',
  });
});

app.get('/accountmanagement', (req, res) => {
  res.render('accountmanagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js', 'mode.js'],
    style: ['default.css', 'accountmanagement.css'],
    dropdown1: app.locals.dropdownFilters,
    dropdown2: app.locals.dietaryRestrictions,
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
