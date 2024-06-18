var express = require('express');
var router = express.Router();
const app = express();


router.get('/', getRecentProfiles, getRecentPosts,  function(req, res, next) {
    requestPrint(req.body);
    res.render('index', null;);
});
