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
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  defaultLayout: 'defaultLayout'
}));

app.set('view engine', 'hbs');

//Middleware Functions to parse json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Add more routes here as needed
app.route('/')
  .get((req, res) => {
    // Serve index.hbs
    res.render('index', {
      script: ['unfinished_button.js', 'dropdown.js', 'autocomplete.js'],
      script: ['unfinished_button.js', 'dropdown.js', 'autocomplete.js'],
      style: ['default.css'],
      title: 'team\'s about page',
      header: 'team\'s about page'
    })
  })
  .post((req, res) => {
    var searchInput = req.body.searchInput;
    res.render('index', {
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
      style: ['default.css'],
      title: 'team\'s about page',
      header: 'team\'s about page',
      header: 'team\'s about page'
    })
  });

// Going to need to create a .env file for this.
// If you are in your local machine, edit these host, user, password, and database for your needs
const pool = mysql.createPool({
  connectionLimit: 100,
    host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
    user: 'backend_lead',
    password: 'password',
    database: 'ScholarEats'
});








//Checking if the database is connected
pool.getConnection( (err)=> {
  if (err) throw (err)
  console.log ("DB connected successful!")
})

// // serve recipes page
// app.get('/recipes', (req, res) => {
//   res.render('recipes', {
//     style: ['default.css', 'recipes.css'],
//     title: 'Recipes',
//     recipe: [{
//       src: '/images/icon_orange.png',
//       alt: 'potato.jpg',
//       name: 'potato',
//       desc: 'lorem ipsum',
//     },
//     {
//       src: '/images/icon_orange.png',
//       alt: 'potato.jpg',
//       name: 'potato',
//       desc: 'lorem ipsum',
//     }]
//   })
// })

// // serve Ingredients page
// app.get('/ingredients', (req, res) => {
//   res.render('ingredients', {
//     style: ['default.css', 'ingredients.css'],
//     title: 'Ingredients',
//     ingredient: [{
//       src: '/images/icon_orange.png',
//       alt: 'potato.jpg',
//       name: 'potato',
//       desc: 'lorem ipsum',
//     },
//     {
//       src: '/images/icon_orange.png',
//       alt: 'potato.jpg',
//       name: 'potato',
//       desc: 'lorem ipsum',
//     }]
//   });
// });

// serve login page
app.get('/login', (req, res) => {
  res.render('login', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'login.css'],
    title: 'Login'
  });
});

// serve forgot password page
app.get('/forgotpassword', (req, res) => {
  res.render('forgotpassword', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'forgotpassword.css'],
    title: 'Forgot Password'
  });
});

// serve registration page
app.get('/register', (req, res) => {
  res.render('register', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'register.css'],
    title: 'Register'
  });
});

app.get('/accountmanagement', (req, res) => {
  res.render('accountmanagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'accountmanagement.css'],
    title: 'Account Management'
  });
});

// Serve static files from the 'website' directory (for existing HTML files)
app.use(express.static(path.join(__dirname, 'public')));

// // Middleware to configure Handlebars
// app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
// app.set('view engine', '.hbs');
// app.set('views', path.join(__dirname, 'views')); // Specify the directory for Handlebars views

// Example route using Handlebars (not converting existing HTML)
app.get('/example', (req, res) => {
    // Render a Handlebars template
    res.render('example', { title: 'Handlebars Example' });
});

// // Serve the main index.html file
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'website/pages', 'index.html'));
// });
// NO LONGER USING HTML


// Add more routes as needed for your existing HTML files
app.get('/', (req, res) => {
    // Serve your existing index.html file
    res.sendFile(path.join(__dirname, 'website/pages', 'index.html'));
});


// test page to test new pages before connecting them
app.get('/test', (req, res) => {
  res.render('accountmanagement', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'accountmanagement.css'],
    title: 'accountmanagement'
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