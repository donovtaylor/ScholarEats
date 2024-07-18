const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const path = require('path');
const exphbs = require('express-handlebars');

const inventoryRoutes = require('./routes/inventoryRoutes_BE');              // Inventory
const userRoutes = require('./routes/userRoutes_BE');                        // User
const recipeRoutes = require('./routes/recipeRoutes_BE');                    // Recipe
const about = require('./routes/about');                                 // About
const autocomplete = require('./routes/autocomplete');

const app = express();

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // for form data

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.user ? true : false;
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

// Add more routes here as needed
app.route('/')
  .get((req, res) => {
    var searchInput = req.query.searchInput;
    res.render('index', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      style: ['default.css'],
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
      title: 'Login'
    })
  })
  .post((req, res) => {
    res.redirect('/index', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      style: ['default.css', 'login.css'],
      title: 'index'
    })
  });

// serve forgot password page
app.get('/forgotpassword', (req, res) => {
  res.render('forgotpassword', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'forgotpassword.css'],
    title: 'Forgot Password'
  });
});

// serve privacy policy and terms of service page
app.get('/privacy_policy', (req, res) => {
  res.render('privacy_policy', {
    style: ['default.css'],
    title: 'Privacy Policy and Terms of Service'
  });
});

// serve contact us page
app.get('/contact_us', (req, res) => {
  const teamMembers = [
    { fName: 'Angelo Arriaga', src: 'images/angelo.jpg', alt: 'angelo.jpg', role: 'Team Lead', email: 'aarriaga1@sfsu.edu' },
    { fName: 'Donovan Taylor', src: 'images/donovan.jpg', alt: 'donovan.jpg', role: 'Frontend Lead', email: 'dvelasquez1@sfsu.edu' },
    { fName: 'Hancun Guo', src: 'images/hancun.jpg', alt: 'hancun.jpg', role: 'Frontend', email: 'hguo4@sfsu.edu' },
    { fName: 'Edward Mcdonald', src: 'images/edward.jpg', alt: 'edward.jpg', role: 'Backend Lead', email: 'emcdonald1@sfsu.edu' },
    { fName: 'Karl Carsola', src: 'images/karl.jpg', alt: 'karl.jpg', role: 'Backend', email: 'kcarsola@mail.sfsu.edu' },
    { fName: 'Sai Bavisetti', src: 'images/sai.jpg', alt: 'sai.jpg', role: 'Database', email: 'sbavisetti@sfsu.edu' },
    { fName: 'Maeve Fitzpatrick', src: 'images/maeve.jpg', alt: 'maeve.jpg', role: 'Docs-Editor', email: 'mfitzpatrick@sfsu.edu' },
    { fName: 'Sabrina Diaz-Erazo', src: 'images/sabrina.jpg', alt: 'sabrina.jpg', role: 'GitHub Master', email: 'sdiazerazo@sfsu.edu' },
    { fName: 'Tina Chou', role: 'Frontend', src: 'images/tina.jpg', alt: 'tina.jpg', email: 'ychou@sfsu.edu' }
  ];
  // add styling to contact_us page
  res.render('contact_us', {
    style: ['default.css'],
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    teamMembers
  });
});

app.use(express.static(path.join(__dirname, 'public')));
// serve registration page
app.get('/register', (req, res) => {
  res.render('register', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'register.css'],
    title: 'Register'
  });
});

// test page to test new pages before connecting them
app.get('/test', (req, res) => {
  res.render('accountmanagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'accountmanagement.css'],
    title: 'Account Management',
  });
});

app.get('/accountmanagement', (req, res) => {
  res.render('accountmanagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'accountmanagement.css'],
    title: 'Account Management',
    dietary_restriction: ['Vegan', 'Keto', 'Hala', 'Vegetarian', 'Pescatarian', 'Kosher']
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
