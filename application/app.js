const express = require('express');
const session = require('express-session');

const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const path = require('path');
const exphbs = require('express-handlebars');

const inventoryRoutes = require('./routes/inventoryRoutes');              // Inventory
const userRoutes = require('./routes/userRoutes');                        // User
const recipeRoutes = require('./routes/recipeRoutes');                    // Recipe
const recipeRoutesGenerator = require('./routes/recipeRoutesGenerator');  // Recipe Generation
const about = require('./routes/about');                                  // About

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // for form data

// Mount routes
app.use("/recipes", recipeRoutes); // Recipe Routes
app.use("/inventory", inventoryRoutes); // Inventory Routes
app.use("/users", userRoutes); // User Routes
app.use("/recipegenerator", recipeRoutesGenerator); // Recipe Generator Routes
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

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
  }));

// Add more routes as needed for your existing HTML files
app.route('/')
  .get((req, res) => {
    // Serve index.hbs
    res.render('index', {
      style: ['default.css'],
      title: 'team\'s about page',
      header: 'team\'s about page'
    })
  })
  .post((req, res) => {
    var searchInput = req.body.searchInput;
    res.render('index', {
      style: ['default.css'],
      title: 'team\'s about page',
      header: searchInput
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

// serve recipes page
app.get('/recipes', (req, res) => {
  res.render('recipes', {
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
    style: ['default.css', 'login.css'],
    title: 'Login'
  });
});

// serve registration page
app.get('/register', (req, res) => {
  res.render('register', {
    style: ['default.css', 'register.css'],
    title: 'Register'
  });
});

app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;


  // Checks if the email/username is already in the database
  pool.query('SELECT * FROM users WHERE email = ? OR username = ?',[email, username], (err,results) => {
      if (results.length > 0) {
          return res.send('Email or username already taken');
      }
  });


  // Hashes the password using bcrypt
  bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
          console.error('Error hashing password:', err);
          return (err);
      }
      // We insert the information that was given into the database
      pool.query('INSERT INTO users (user_id, email, username, password) VALUES (UUID(), ?, ?, ?)', [email, username, hash], (err, result) => {
          if (err) {
              console.error('Error inserting user:', err);
              return (err);
          }
          res.send('User registered successfully');
      });
  });
});



app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // Query to find user based on email
  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).send('Database error');
    }
    
    // Check if user exists
    if (results.length === 0) {
      return res.send('Invalid Email or Password');
    }
    
    const user = results[0];

    // Compare password with hashed password in database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Authentication error');
      }
      
      if (!isMatch) {
        return res.send('Invalid Email or Password');
      }

      // Store user data in session upon successful login
      req.session.user = { email: user.email, username: user.username };
      res.send('Logged in successfully!');
      res.redirect('/');
    });
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return err;
      }
      // Clear the session cookie
      res.clearCookie('connect.sid'); 
      res.json({ message: 'Logged out successfully' });
  });
});


app.post('/change-password',(req, res) =>{
  const newPass = req.body.newPass;
  const currentPass = req.body.currentPass;
  const confirmPass = req.body.confirmPass;

  

  pool.query('SELECT * FROM users WHERE username = ?', [req.session.user.username], (err, results) => {
      if (err) {
          return err;
      }
      const user = results[0];
      bcrypt.compare(currentPass, user.password, (err, isMatch) =>{
          if (err){
              return err;
          }
          if (!isMatch){
              return res.send("Incorrect Password");
          }

          if(newPass != confirmPass){
      
              return res.send("Password Doesn't Match")
          }

          bcrypt.hash(newPass, 10, (err, hash) => {
              if (err){
                  return err;
              }
          
              pool.query("UPDATE users SET password = ? WHERE username = ?", [hash, req.session.user.username], (err, result) =>{
                  if (err){
                      return err;
                  }
                  res.send("successfully changed password!");
              });
          });
      });


  });
});

// NOTE: NEED TO ADD A CHECK IF THE USERNAMEIS TAKEN OR NOT
app.post("/change-username",(req, res) =>{

  const newUsername = req.body.newUsername;
  //console.log("Request body:", req.body);
  //console.log("Session:", req.session);

  pool.query("UPDATE users SET username = ? WHERE email = ?", [newUsername, req.session.user.email], (err, result) => {
      if (err){
          return err;
      }
      req.session.user.username = newUsername;
      res.send("successfully changed username!");
  });
});


// Displays the status wheter if we are logged in or not.
app.get("/status", (req, res) => {
  if (req.session.user) {
      res.json({ loggedIn: true, user: req.session.user });
  } else {
      res.json({ loggedIn: false });
  }
});

// Serve static files from the 'website' directory (for existing HTML files)
app.use(express.static(path.join(__dirname, 'website/pages')));

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

// Mount routes
app.use('/recipes', recipeRoutes); // Recipe Routes
app.use('/inventory', inventoryRoutes); // Inventory Routes
app.use('/users', userRoutes); // User Routes
app.use('/recipes', recipeRoutesGenerator); // Recipe Generator Routes

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