const db = require('../models');

module.exports = function(app) {
  // Find all Segments and return them to the user with res.json
  // Here we add an "include" property to our options in our findAll query
  // We set the value to an array of the models we want to include in a left outer join
  // In this case, just db.SubSegment
  app.get('/api/segments', async (req, res) => {
    try {
      const data = await db.Segment.findAll({
        include: [db.SubSegment],
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
    // In this case, just db.SubSegment
    try {
      const data = await db.Segment.findOne( // findOne returns a single object.  findAll returns an array of objects
          {
            where: {id: req.params.id},
            include: [db.SubSegment],
          },
      );
      res.json(data);
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  app.post('/api/segments', async (req, res) => {
    // Create an Segment with the data available to us in req.body
    console.log("req.body: ", req.body);
    const {name, deal_size, deal_count} = req.body;

    const sgmt_rev = (deal_size * deal_count);
    console.log("sgmt_rev: ", sgmt_rev);

    try {
      const result = await db.Segment.create({name, deal_size, deal_count, sgmt_rev});
      // const result = await db.Segment.create({name, deal_size, deal_count});
      res.json({created: result.dataValues});
    } catch (error) {
      res.status(400).json({error: {name: error.name, msg: error.message}});
    }
  });

  app.delete('/api/segments/:id', async (req, res) => {
    // Delete the Segment with the id available to us in req.params.id
    // Due to the association set up in the model, deleting an segment
    // will delete all of their subsegments as well.
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

  // PUT route for updating subsegments
  app.put('/api/segments', async (req, res) => {
    // Add code here to update a segment using the values in req.body, where the id is equal to
    // req.body.id and return the result to the user using res.json
    // const {id, name} = req.body;
    const {id, name, deal_size, deal_count, deal_size_yoy, deal_count_yoy, next_year_deal_size, next_year_deal_count, next_year_sgmt_rev} = req.body;
    console.log("name: ", name);

    try {
      const result = await db.Segment.update(
          {name, deal_size, deal_count, deal_size_yoy, deal_count_yoy, next_year_deal_size, next_year_deal_count, next_year_sgmt_rev},
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
