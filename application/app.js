const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const path = require('path');
const exphbs = require('express-handlebars');

const inventoryRoutes = require('./routes/inventoryRoutes');              // Inventory
const userRoutes = require('./routes/userRoutes');                        // User
const recipeRoutes = require('./routes/recipeRoutes');                    // Recipe
const about = require('./routes/about');                                  // About

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
app.use(express.urlencoded({extended: true}));

// Add more routes here as needed
app.route('/')
  .get((req, res) => {
    var searchInput = req.query.searchInput;
    console.log(searchInput);
    res.render('index', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      style: ['default.css'],
      title: 'team\'s about page',
      header: 'team\'s about page',
      filter_option: ['option1','option2','option3']
    })
  });


// serve recipes page
app.get('/recipes', (req, res) => {
  res.render('recipes', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'recipes.css'],
    title: 'Recipes',
    filter_option: ['option1','option2','option3'],
    recipe: [{
      src: '/images/icon_orange.png',
      alt: 'potato.jpg',
      name: 'potato',
      desc: 'lorem ipsum',
    },
    {
      src: '/images/icon_orange.png',
      alt: 'potato.jpg',
      name: 'potato',
      desc: 'lorem ipsum',
    }]
  })
})

// serve Ingredients page
app.get('/ingredients', (req, res) => {
  res.render('ingredients', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'ingredients.css'],
    title: 'Ingredients',
    filter_option: ['option1','option2','option3'],
    ingredient: [{
      src: '/images/icon_orange.png',
      alt: 'potato.jpg',
      name: 'potato',
      desc: 'lorem ipsum',
    },
    {
      src: '/images/icon_orange.png',
      alt: 'potato.jpg',
      name: 'potato',
      desc: 'lorem ipsum',
    }]
  });
});

// serve login page
app.get('/login', (req, res) => {
  res.render('login', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'login.css'],
    title: 'Login',
    filter_option: ['option1','option2','option3']
  });
});

// serve forgot password page
app.get('/forgotpassword', (req, res) => {
  res.render('forgotpassword', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'forgotpassword.css'],
    title: 'Forgot Password',
    filter_option: ['option1','option2','option3']
  });
});

// serve registration page
app.get('/register', (req, res) => {
  res.render('register', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'register.css'],
    title: 'Register',
    filter_option: ['option1','option2','option3']
  });
});

// test page to test new pages before connecting them
app.get('/test', (req, res) => {
  res.render('accountmanagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'accountmanagement.css'],
    title: 'accountmanagement',
    filter_option: ['option1','option2','option3'],
    dietary_restriction: ['option4','option5','option6']
  });
});

app.get('/accountmanagement', (req, res) => {
  res.render('accountmanagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'accountmanagement.css'],
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