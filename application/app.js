const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars'); // Import express-handlebars
const about = require(path.join(__dirname, 'routes/about'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // for form data
app.use("/about", about);

// Middleware to configure Handlebars
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  defaultLayout: 'defaultLayout'
}));

app.set('view engine', 'hbs');

// Add more routes as needed for your existing HTML files
app.route('/')
  .get((req, res) => {
    // Serve index.hbs
    res.render('index', {
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
      style: ['default.css'],
      title: 'team\'s about page',
      header: 'team\'s about page'
    })
  });


// serve recipes page
app.get('/recipes', (req, res) => {
  res.render('recipes', {
    script: ['dropdown.js', 'unfinished_button.js', 'autocomplete.js'],
    style: ['default.css', 'recipes.css'],
    title: 'Recipes',
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