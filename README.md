* **Folder**: `11-Blogger`

* **INSTRUCTIONS**:

  The goal of this exercise is to create a Post model using Sequelize.

  1) Open the folder slacked out to you, run `npm install`

  2) Create a new MySQL database and name it `blogger`. Don't create any tables.
  
  3) In terminal, type in the following commands (hit enter after each): 
     1) `npx sequelize init:models`
     2) `npx sequelize init:config`

  4) Open the `config` folder and update the `config.json` file's `development` object to match your own local MySQL database.

  5) Go to the `models` folder and add a `post.js` file.

  6) Create a Sequelize `Post` model here. The model should have a title property of type DataTypes.STRING, a body property of DataTypes.TEXT, and a category property of DataTypes.STRING. 
  (<http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types>)

  6) To check if this worked, run `npm run watch` in your terminal. Then open MySQL Workbench to check if a Posts table has been created.
  
  7) Go back to the Post model and add the following:
     1) Flags to the title and body to prevent NULL values from being entered.

     2) A validation to the title so that it must be between 1 and 160 characters.

     3)  A validation to the body so that it must be at least 1 character long.

     4)  A flag to the category so that it has a default value of "Personal" if a value is not supplied.

  8) Navigate to the `post-api-routes.js` file inside of the `routes` folder.

  9) Fill in each route with the code described in the comments to add each CRUD action.
  We can test our code works by checking to see if we have the following functionality (recommended order):

  * Create a new post
  * Get a list of all posts
    * Get a list of all posts of a category
    * Edit a post
    * Delete a post

  10) Navigate to the `post.js` file.

  11) You will need to set an `associate` property to the `Post` model after it's defined. There's an example of this type of association being done here: 
  <https://github.com/sequelize/express-example/blob/master/models/task.js>

  * This may take a few tries to implement correctly in your own Post model (There's a lot of curly braces there!). You can verify your code works by starting your node server and then checking MySQL Workbench. If the Posts table now has a foreign key of AuthorId, you were successful.

  * If you complete the exercise before time's up, navigate to the author.js file and add a **hasMany** association from the Author model to the Post Model. An example of this type of association can be found here: 
  <https://github.com/sequelize/express-example/blob/master/models/user.js>

  12) Navigate to the `post-api-routes.js` file.

  13) Add the "include" option to the queries specified in the comments. This is a feature called "eager loading". We want to "include" the Author model. Examples can be found here:
  <http://docs.sequelizejs.com/manual/tutorial/models-usage.html#eager-loading>
  
  14)  Create a Sequelize `Author` model here. The model should have a name property of type DataTypes.STRING,
  (<http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types>)

  16) Navigate to the `author-api-routes.js` file and add the "include" option to the queries specified in the comments. Here we want to "include" the Post model.

  17) If successful the application should now be fully functional. After you create a few Authors with a few posts, try navigating to either `localhost:8080/api/posts` or `localhost:8080/api/authors` to make sure the JSON returned for both routes includes all of the data.

  **Hint**: The "include" key goes on the same options object as the "where" attribute we've been using. Examples can be found at the link supplied.
