const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars'); // Import express-handlebars

const app = express();

// Serve static files from the 'website' directory (for existing HTML files)
app.use(express.static(path.join(__dirname, 'website/pages')));

// Middleware to configure Handlebars
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views')); // Specify the directory for Handlebars views

// Example route using Handlebars (not converting existing HTML)
app.get('/example', (req, res) => {
    // Render a Handlebars template
    res.render('example', { title: 'Handlebars Example' });
});

// Add more routes as needed for your existing HTML files
app.get('/', (req, res) => {
    // Serve your existing index.html file
    res.sendFile(path.join(__dirname, 'website/pages', 'index.html'));
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