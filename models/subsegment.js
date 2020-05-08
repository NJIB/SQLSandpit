module.exports = function(sequelize, DataTypes) {
  const SubSegment = sequelize.define('SubSegment', {
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

  SubSegment.associate = function(models) {
    // We're saying that a SubSegment should belong to an Segment
    // A SubSegment can't be created without an Segment due to the foreign key constraint
    SubSegment.belongsTo(models.Segment, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return SubSegment;
};
