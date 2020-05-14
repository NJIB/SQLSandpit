module.exports = function(sequelize, DataTypes) {
  const Segment = sequelize.define('Segment', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 160],
      },
    },
    deal_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

  });

  Segment.associate = function(models) {
    // Associating Segment with SubSegments
    // When an Segment is deleted, also delete any associated SubSegments
    Segment.hasMany(models.SubSegment, {
      onDelete: 'cascade',
    });
  };


  return Segment;
};