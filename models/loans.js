'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loan = sequelize.define('Loan', {
    id: DataTypes.INTEGER,
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A book id is required'
        }
      }
    },
    patron_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A patron id is required'
        }
      }
    }, 
    loaned_on: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A loaned on field is required'
        }
      }
    }, 
    return_by: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A return by field is required'
        }
      }
    }, 
    returned_on: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Loan.belongsTo(models.Book, {foreignKey:'book_id'});
        Loan.belongsTo(models.Patron, {foreignKey:'patron_id'});
      }
    },
    timestamps: false
  });
  return Loan;
};