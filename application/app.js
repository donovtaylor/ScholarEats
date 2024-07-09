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
      script: ['unfinished_button.js', 'dropdown.js'],
      style: ['default.css'],
      title: 'team\'s about page',
      header: 'team\'s about page'
    })
  })
  .post((req, res) => {
    var searchInput = req.body.searchInput;
    res.render('index', {
      script: ['dropdown.js', 'unfinished_button.js'],
      style: ['default.css'],
      title: 'team\'s about page',
      header: 'team\'s about page'
    })
  });


// serve recipes page
app.get('/recipes', (req, res) => {
  res.render('recipes', {
    script: ['dropdown.js', 'unfinished_button.js'],
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
    script: ['dropdown.js', 'unfinished_button.js'],
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
    script: ['dropdown.js', 'unfinished_button.js'],
    style: ['default.css', 'login.css'],
    title: 'Login'
  });
});

// serve contact us page
app.get('/contact_us', (req, res) => {
  const teamMembers = [
    {fName: 'Angelo Arriaga', src: 'images/angelo.jpg', alt: 'angelo.jpg',  role: 'Team Lead', email: 'aarriaga1@sfsu.edu'},
    {fName: 'Donovan Taylor', src: 'images/donovan.jpg', alt: 'donovan.jpg', role: 'Frontend Lead', email: 'dvelasquez1@sfsu.edu'},
    {fName: 'Hancun Guo',src: 'images/hancun.jpg', alt: 'hancun.jpg', role: 'Frontend', email: 'hguo4@sfsu.edu'},
    {fName: 'Edward Mcdonald',src: 'images/edward.jpg', alt: 'edward.jpg', role: 'Backend Lead', email: 'emcdonald1@sfsu.edu'},
    {fName: 'Karl Carsola',src: 'images/karl.jpg', alt: 'karl.jpg', role: 'Backend', email: 'kcarsola@mail.sfsu.edu'},
    {fName: 'Sai Bavisetti',src: 'images/sai.jpg', alt: 'sai.jpg', role: 'Database', email: 'sbavisetti@sfsu.edu'},
    {fName: 'Maeve Fitzpatrick',src: 'images/maeve.jpg', alt: 'maeve.jpg', role: 'Docs-Editor', email: 'mfitzpatrick@sfsu.edu'},
    {fName: 'Sabrina Diaz-Erazo',src: 'images/sabrina.jpg', alt: 'sabrina.jpg', role: 'GitHub Master', email: 'sdiazerazo@sfsu.edu'},
    {fName: 'Tina', role: 'Frontend',src: 'images/tina.jpg', alt: 'tina.jpg', email: 'ychou@sfsu.edu'}
  ];
  // add styling to contact_us page
  res.render('contact_us', { style: ['default.css'], teamMembers });
});

app.use(express.static(path.join(__dirname, 'public')));
// serve registration page
app.get('/register', (req, res) => {
  res.render('register', {
    script: ['dropdown.js', 'unfinished_button.js'],
    style: ['default.css', 'register.css'],
    title: 'Register'
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