const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars'); // Import express-handlebars

const app = express();


// Serve static files from the 'website' directory (for existing HTML files)
// app.use(express.static(path.join(__dirname, 'website/pages/images')));

// Middleware to configure Handlebars
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  defaultLayout:'defaultLayout'
}));

app.set('view engine', 'hbs');


// Example route using Handlebars (not converting existing HTML)
app.get('/example', (req, res) => {
    // Render a Handlebars template
    res.render('example', { title: 'Handlebars Example' });
});

// Add more routes as needed for your existing HTML files
app.get('/', (req, res) => {
    // Serve index.hbs
    res.render('index');
});

// server angelo's page dynamically using handlebars
app.get('/angelo', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Angelo',
    src:'images/angelo.jpg',
    alt:'angelo.jpg',
    desc:'Angelo is a student at San Francisco State University. Has an aptitude for many hobbies ranging from sewing and clothesmaking to 3D modelling in Blender. Started at SFSU in January 2023 after finishing an enlistment in the United States Marine Corps and is expecting to graduate Decemeber 2024 with a B.S. in Computer Science and a Minor in Mathematics.'
  });
});

// serve donovan's page
app.get('/donovan', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Donovan',
    src: 'images/donovan.jpg',
    alt:'donovan.jpg',
    desc:'Donovan is a student at SFSU who is passionate about computer science and expanding his teamwork abilities.'
  });
});

// serve hancun's page
app.get('/hancun', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Hancun',
    src: 'images/hancun.jpg',
    alt:'hancun.jpg',
    desc:'Hancun is a student at SFSU who loves video games.'
  });
});

// serve edward's page
app.get('/edward', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Edward',
    src: 'images/edward.jpg',
    alt:'edward.jpg',
    desc:'Edward is a CS student at SFSU'
  });
});

// serve karl's page
app.get('/karl', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Karl',
    src: 'images/karl.jpg',
    alt:'karl.jpg',
    desc:'Karl is currently attending his last year at San Francisco State University majoring in Computer Science and is eager to his expand his knowledge in the field.'
  });
});

// serve sai's page
app.get('/sai', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Sai',
    src: 'images/sai.jpg',
    alt:'sai.jpg',
    desc:'I am Sai Saketh Bavisetti, currently pursuing a Masters in Data Science and AI at San Francisco State University. With a background in Computer Science from GITAM, INDIA, I specialize in developing and analyzing complex algorithms and data using a variety of programming languages and machine learning tools.'
  });
});

// serve maeve's page
app.get('/maeve', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Maeve',
    src: 'images/maeve.jpg',
    alt:'maeve.jpg',
    desc:'Maeve is a student at SFSU from San Francisco who loves spending time with family and helping others.'
  });
});

// serve sabrina's page
app.get('/sabrina', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Sabrina',
    src: 'images/sabrina.jpg',
    alt:'sabrina.jpg',
    desc:'Sabrina is a student at SFSU who aspires to improve others\' lives through her work.'
  });
});

// serve tina's page
app.get('/tina', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    fName:'Tina',
    src: 'images/tina.jpg',
    alt:'tina.jpg',
    desc:''
  });
});

app.use(express.static(path.join(__dirname, 'public')));

// 404 Error handling
app.use((req, res, next) => {
    res.status(404).send('404 Page Not Found');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});