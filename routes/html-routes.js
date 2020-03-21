// *********************************************************************************
// html-routes.js - this file offers a set of routes for sending users to the various html pages
// *********************************************************************************

// Dependencies
// =============================================================
const path = require('path');

// Routes
// =============================================================
module.exports = function(app) {
  // Each of the below routes just handles the HTML page that the user gets sent to.

  // index route loads view.html
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/comment.html'));
  });

  // Route to the cms page
  app.get('/cms', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/cms.html'));
  });

  // comment route loads comment.html
  app.get('/comment', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/comment.html'));
  });

  // persons route loads person-manager.html
  app.get('/persons', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/person-manager.html'));
  });
};
