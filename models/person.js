module.exports = function(sequelize, DataTypes) {
  const Person = sequelize.define('Person', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 160],
      },
    },
  });

  Person.associate = function(models) {
    // Associating Person with Comments
    // When an Person is deleted, also delete any associated Comments
    Person.hasMany(models.Comment, {
      onDelete: 'cascade',
    });
  };


  return Person;
};
