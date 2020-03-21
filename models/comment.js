module.exports = function(sequelize, DataTypes) {
  const Comment = sequelize.define('Comment', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 160],
      },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'Personal',
      allowNull: false,
    },
  });

  Comment.associate = function(models) {
    // We're saying that a Comment should belong to an Person
    // A Comment can't be created without an Person due to the foreign key constraint
    Comment.belongsTo(models.Person, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return Comment;
};
