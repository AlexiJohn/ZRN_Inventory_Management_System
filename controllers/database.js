var mysql = require('mysql');
var express = require('express');

var conn = mysql.createConnection({
  host: 'localhost', // Replace with your host name
  user: 'artx',      // Replace with your database username
  password: 'ArtxIMS2021',  // Replace with your database password
  database: 'artxims' // // Replace with your database Name
}); 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});

module.exports = conn;