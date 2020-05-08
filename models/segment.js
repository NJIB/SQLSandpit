module.exports = function(sequelize, DataTypes) {
  const Segment = sequelize.define('Segment', {
    segment: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 160],
      },
    },
    deal_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deals_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sgmt_rev: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Segment.associate = function(models) {
    // Associating Segment with SubSegments
    // When a Segment is deleted, also delete any associated Comments
    Segment.hasMany(models.SubSegment, {
      onDelete: 'cascade',
    });
  };


  return Segment;
};
