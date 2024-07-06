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
      style: 'default.css',
      title: 'team\'s about page',
      header: 'team\'s about page'
    })
  })
  .post((req, res) => {
    var searchInput = req.body.searchInput;
    res.render('index', {
      style: 'default.css',
      title: 'team\'s about page',
      header: searchInput
    })
  });

// serve login page
app.get('/login', (req, res) => {
  res.render('login');
});

// serve registration page
app.get('/register', (req, res) => {
  res.render('register');
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