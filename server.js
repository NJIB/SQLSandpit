// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
require('dotenv').config();
const express = require('express');

// Requiring our models for syncing
const db = require('./models');

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;


// Sets up the Express app to handle data parsing
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Static directory
app.use(express.static('public'));

// Routes
// ===============================
require('./routes/html-routes')(app);
require('./routes/person-api-routes')(app);
require('./routes/comment-api-routes')(app);

// Syncing our sequelize models Starting our Express app
// =============================================================
async function startup() {
  const dbOutput = await db.sequelize.sync({force: false});
  console.log('----------------------------');
  console.log('DATABASE SERVER CONNECTED');
  console.group('DATABASE CONFIG');
  console.table(dbOutput.config);
  console.groupEnd();

  console.group('DATABASE OPTIONS');
  console.table(dbOutput.options);
  console.groupEnd();

  await app.listen(PORT);
  console.log('----------------------------');
  console.log(`WEB SERVER LISTENING ON: http://localhost:${PORT}`);
}

startup();

