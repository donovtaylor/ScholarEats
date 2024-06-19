const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const indexRouter = require("./routes/index");

const app = express();

// Set up Handlebars view engine
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

// Serve static files from the "public" directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Middleware to log session info and set response locals
app.use(function(req, res, next) {
    console.log(req.session);
    if (req.session.user) {
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user;
    }
    next();
});

// Use the router middleware from ./routes/index.js
app.use("/", indexRouter);

// 404 error handling middleware
app.use((req, res, next) => {
    next(createError(404, `The route ${req.method} : ${req.url} does not exist.`));
});

module.exports = app;