module.exports = function(sequelize, DataTypes) {
    const Route = sequelize.define('Route', {
      hurdle: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 160],
        },
      },
      markets: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1],
        },
      },
      buyers: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1],
        },
      },
      offerings: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1],
        },
      },
      productivity: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1],
        },
      },
      acquisition: {
        type: DataTypes.TEXT,
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