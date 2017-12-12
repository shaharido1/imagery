const mongoose = require('mongoose');

const configDB = require('../config/database.js');

const dbHandler = {
  connect: function () {
    mongoose.connect(configDB.url); // connect to our database
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
      console.log("mongo connected!")
      // we're connected!
    });
  }
};


module.exports = dbHandler.connect();
