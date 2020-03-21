// *********************************************************************************
// post-api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
const db = require('../models');

// Routes
// =============================================================
module.exports = function(app) {
  // GET route for getting all of the posts
  app.get('/api/posts', async (req, res) => {
    // Add sequelize code to find all posts, and return them to the user with res.json
    const query = {};
    if (req.query.author_id) {
      query.AuthorId = req.query.author_id;
    }
    // In our findAll argument, we add a 'where' property, that could be empty
    // depending on whether or not the request has an 'author_id' key/value pait in the query string.
    // We also add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Author
    try {
      const data = await db.Post.findAll({
        where: query,
        include: [db.Author],
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // Get route for returning posts of a specific category
  app.get('/api/posts/category/:category', async (req, res) => {
    // Add sequelize code to find all posts where the category is equal to req.params.category,
    // return the result to the user with res.json
    // We build up the query object with a category property.
    // If the request has an 'author_id' key/value pair in the query string, we
    // we add an AuthorId property to the query object.
    // Then entire query object will be passed as the object for 'where' in the findAll argument.
    const query = {
      category: req.params.category,
    };
    if (req.query.author_id) {
      query.AuthorId = req.query.author_id;
    }
    // We also add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Author
    try {
      const data = await db.Post.findAll({
        where: query,
        include: [db.Author],
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // Get route for retrieving a single post
  app.get('/api/posts/:id', async (req, res) => {
    // Add sequelize code to find a single post where the id is equal to req.params.id,
    // return the result to the user with res.json
    // We add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Author
    try {
      const data = await db.Post.findOne({
        where: {id: req.params.id},
        include: [db.Author],
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // POST route for saving a new post
  app.post('/api/posts', async (req, res) => {
    // Add sequelize code for creating a post using req.body,
    // then return the result using res.json
    try {
      const result = await db.Post.create(req.body);
      res.json({created: result.dataValues});
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // DELETE route for deleting posts
  app.delete('/api/posts/:id', async (req, res) => {
    // Add sequelize code to delete a post where the id is equal to req.params.id,
    // then return the result to the user using res.json
    try {
      const result = await db.Post.destroy(
          {
            where: {id: req.params.id},
          },
      );
      const deletedRowCount = result;
      const status = deletedRowCount > 0 ? 200 : 404;
      res.status(status).json({deletedRowCount});
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // PUT route for updating posts
  app.put('/api/posts', async (req, res) => {
    // Add code here to update a post using the values in req.body, where the id is equal to
    // req.body.id and return the result to the user using res.json
    const {id, title, body, category} = req.body;

    try {
      const result = await db.Post.update(
          {title, body, category},
          {where: {id}},
      );
      const affectedRowCount = result[0];
      const status = affectedRowCount > 0 ? 200 : 404;
      res.status(status).json({affectedRowCount});
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });
};
