// *********************************************************************************
// comment-api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
const db = require('../models');

// Routes
// =============================================================
module.exports = function(app) {
  // GET route for getting all of the comments
  app.get('/api/subsegments', async (req, res) => {
    // Add sequelize code to find all comments, and return them to the user with res.json
    const query = {};
    if (req.query.segment_id) {
      query.SegmentId = req.query.segment_id;
    }
    // In our findAll argument, we add a 'where' property, that could be empty
    // depending on whether or not the request has an 'segment_id' key/value pait in the query string.
    // We also add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Segment
    try {
      const data = await db.SubSegment.findAll({
        where: query,
        include: [db.Segment],
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // Get route for returning comments of a specific category
  app.get('/api/subsegments/category/:category', async (req, res) => {
    // Add sequelize code to find all comments where the category is equal to req.params.category,
    // return the result to the user with res.json
    // We build up the query object with a category property.
    // If the request has an 'segment_id' key/value pair in the query string, we
    // we add an SegmentId property to the query object.
    // Then entire query object will be passed as the object for 'where' in the findAll argument.
    const query = {
      category: req.params.category,
    };
    if (req.query.segment_id) {
      query.SegmentId = req.query.segment_id;
    }
    // We also add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Segment
    try {
      const data = await db.SubSegment.findAll({
        where: query,
        include: [db.Segment],
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // Get route for retrieving a single comment
  app.get('/api/subsegments/:id', async (req, res) => {
    // Add sequelize code to find a single comment where the id is equal to req.params.id,
    // return the result to the user with res.json
    // We add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Segment
    try {
      const data = await db.SubSegment.findOne({
        where: {id: req.params.id},
        include: [db.Segment],
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // POST route for saving a new comment
  app.post('/api/subsegments', async (req, res) => {
    // Add sequelize code for creating a comment using req.body,
    // then return the result using res.json
    console.log("req.body: ", req.body);
    
    try {
      console.log("req.body: ", req.body);
      const result = await db.SubSegment.create(req.body);
      res.json({created: result.dataValues});
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  // // POST route for saving a new comment
  // app.post('/api/subsegments', async (req, res) => {
  //   // Add sequelize code for creating a comment using req.body,
  //   // then return the result using res.json
  //   try {
  //     const result = await db.Route.create(req.body);
  //     res.json({created: result.dataValues});
  //   } catch (error) {
  //     res.status(400).json({error: {name: error.name, msg: error.message}});
  //   }
  // });

  // DELETE route for deleting comments
  app.delete('/api/subsegments/:id', async (req, res) => {
    // Add sequelize code to delete a comment where the id is equal to req.params.id,
    // then return the result to the user using res.json
    try {
      const result = await db.SubSegment.destroy(
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

  // PUT route for updating comments
  app.put('/api/subsegments', async (req, res) => {
    // Add code here to update a comment using the values in req.body, where the id is equal to
    // req.body.id and return the result to the user using res.json
    const {id, hurdle, markets, buyers, offerings, productivity, acquisition} = req.body;
    console.log("id: ", id);

    try {
      // const result = await db.SubSegment.update(
        const result = await db.SubSegment.update(
          {hurdle, markets, buyers, offerings, productivity, acquisition},
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
