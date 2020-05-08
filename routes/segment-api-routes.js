const db = require('../models');

module.exports = function(app) {
  // Find all Segments and return them to the user with res.json
  // Here we add an "include" property to our options in our findAll query
  // We set the value to an array of the models we want to include in a left outer join
  // In this case, just db.Comment
  app.get('/api/segments', async (req, res) => {
    try {
      const data = await db.Segment.findAll({
        include: [db.Comment],
      });
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  app.get('/api/segments/:id', async (req, res) => {
    // Find one Segment with the id in req.params.id and return them to the user with res.json
    // Here we add an "include" property to our options in our findOne query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.Comment
    try {
      const data = await db.Segment.findOne( // findOne returns a single object.  findAll returns an array of objects
          {
            where: {id: req.params.id},
            include: [db.Comment],
          },
      );
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  app.post('/api/segments', async (req, res) => {
    // Create an Segment with the data available to us in req.body
    const {name} = req.body;
    try {
      const result = await db.Segment.create({name});
      res.json({created: result.dataValues});
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  app.delete('/api/segments/:id', async (req, res) => {
    // Delete the Segment with the id available to us in req.params.id
    // Due to the association set up in the model, deleting an Segment
    // will delete all of their comments as well.
    try {
      const result = await db.Segment.destroy(
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
  app.put('/api/segments', async (req, res) => {
    // Add code here to update a comment using the values in req.body, where the id is equal to
    // req.body.id and return the result to the user using res.json
    const {id, name} = req.body;

    try {
      const result = await db.Segment.update(
          {name},
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
