var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index');
});

// Placeholder middleware functions
function getRecentProfiles(req, res, next) {
    // Simulate fetching recent profiles
    req.recentProfiles = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ];
    next();
}

function getRecentPosts(req, res, next) {
    // Simulate fetching recent posts
    req.recentPosts = [
        { id: 1, title: 'Post One', content: 'Content for post one' },
        { id: 2, title: 'Post Two', content: 'Content for post two' }
    ];
    next();
}

function requestPrint(body) {
    // Simulate printing request body
    console.log('Request Body:', body);
}

// Route definition
router.get('/', getRecentProfiles, getRecentPosts, function(req, res, next) {
    requestPrint(req.body);
    res.render('index', {
        profiles: req.recentProfiles,
        posts: req.recentPosts
    });
});

module.exports = router;
