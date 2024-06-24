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

app.get('/angelo', (req, res) => {
  res.render('about', {
    layout:'aboutPageLayout', 
    FName:'Angelo',
    src:path.join(__dirname, 'public/images/angelo.jpg'),
    alt:'angelo.jpg',
    desc:'Angelo is a student at San Francisco State University. Has an aptitude for many hobbies ranging from sewing and clothesmaking to 3D modelling in Blender. Started at SFSU in January 2023 after finishing an enlistment in the United States Marine Corps and is expecting to graduate Decemeber 2024 with a B.S. in Computer Science and a Minor in Mathematics.'
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