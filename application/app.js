const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const indexRouter = require("./routes/index");

const app = express();

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(function(req,res,next){
    console.log(req.session);
    if(req.session.user){
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user;
    }
    next();
})

app.use("/", indexRouter); // route middleware from ./routes/index.js

app.use((req,res,next) => {
  next(createError(404, `The route ${req.method} : ${req.url} does not exist.`));
})

module.exports = app;
