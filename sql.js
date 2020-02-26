var mysql = require('mysql');

var connect = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qwerty123456",
  database: 'shooter'
});

var props = `name, pass, salt, score, lvl, money, upmax, upspeed, upspeedbullet, upvisibility, daylastseen`;
const select = 'SELECT * FROM players';
const describe = 'DESCRIBE players';
const createDataBASE = 'CREATE DATABASE rpg'
const drop = 'DROP TABLE players';
const command = 'CREATE TABLE if not exists players(id int primary key auto_increment, name varchar(20) not null, pass varchar(250) not null, salt varchar(250) not null, score int not null, lvl MEDIUMINT not null, money int not null, upmax tinyint not null, upspeed tinyint not null, upspeedbullet tinyint not null, upvisibility tinyint not null, daylastseen int not null) CHARSET=utf8';

connect.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  connect.query(drop, function (err, result) {
    connect.query(command, function (err, result) {
      if (err) throw err;
      console.log(result);
    });
  });
});