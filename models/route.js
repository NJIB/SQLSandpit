module.exports = function(sequelize, DataTypes) {
    const Route = sequelize.define('Route', {
      hurdle: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 160],
        },
      },
      markets: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 160],
        },
      },
      buyers: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 160],
        },
      },
      offerings: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 160],
        },
      },
      productivity: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 160],
        },
      },
      acquisition: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1],
        },
      },
    });
  
    Route.associate = function(models) {
      // We're saying that a SubSegment should belong to an Segment
      // A SubSegment can't be created without an Segment due to the foreign key constraint
      Route.belongsTo(models.Segment, {
        foreignKey: {
          allowNull: false,
        },
      });
    };
  
    return Route;
  };