'use strict';
module.exports = (sequelize, DataTypes) => {
  var Book = sequelize.define('Book', {
    id: DataTypes.INTEGER,
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A Title is required'
        }
      }
    },
    author:{
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A Author is required'
        }
      }
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A genre is required'
        }
      }
    },
    first_published: DataTypes.INTEGER
     }, {
    classMethods: {
      associate: function(models) {
        Book.hasMany(models.Loan, {foreignKey:'book_id'});
      }
    },
    timestamps: false
  });
  return Book;
};