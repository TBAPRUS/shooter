const mysql = require('mysql');
const bcrypt = require('bcryptjs');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qwerty123456",
  database: "shooter"
});
class Player {
  constructor(obj) {
    for(var key in obj) {
      this[key] = obj[key];
    }
  }
  register(cb) {
    this.score = 0;
    this.lvl = 0;
    this.money = 0;
    this.upmax = 0;
    this.upspeed = 0;
    this.upspeedbullet = 0;
    this.upvisibility = 0;
    this.daylastseen = Math.round(Date.now()/1000/60/60/24);
    this.hashPassword((err) => {
      if(err) return cb(err);
      var values = `"${this.name}","${this.pass}","${this.salt}","${this.score}","${this.lvl}","${this.money}","${this.upmax}","${this.upspeed}","${this.upspeedbullet}","${this.upvisibility}","${this.daylastseen}"`;
      var props = `name, pass, salt, score, lvl, money, upmax, upspeed, upspeedbullet, upvisibility, daylastseen`;
      con.query(`INSERT INTO players(${props}) VALUE(${values})`, (err) => {
        if(err) throw err;
        return cb();
      });
    });
  }
  hashPassword(cb) {
    bcrypt.genSalt(12, (err, salt) => {
      if(err) return cb(err);
      this.salt = salt;
      bcrypt.hash(this.pass, salt, (err, hash) => {
        if(err) return cb(err);
        this.pass = hash;
        return cb();
      });
    });
  }
  static checkName(check, cb) {
    con.query('SELECT name FROM players', (err, names) => {
      if(err) return cb(err);
      for(var name of names) {
        if(name.name == check) return cb(null, true);
      }
      return cb(null, false);
    });
  }
  static getByName(name, cb) {
    this.checkName(name, (err, bool) => {
      if(err) return cb(err);
      if(bool) {
        con.query(`SELECT * FROM players WHERE name="${name}"`, (err, player) => {
          if(err) return cb(err);
          return cb(null, new Player(player[0]));
        });
      } else {
        return cb();
      }
    });
  }
  static getById(id, cb) {
    con.query(`SELECT * FROM players WHERE id = ${id}`, (err, player) => {
      if(err) return cb(err);
      cb(err, new Player(player[0]));
    });
  }
  static authenticate(name, pass, cb) {
    Player.getByName(name, (err, player) => {
      if(err) return cb(err);
      if(!player) return cb();
      bcrypt.hash(pass, player.salt, (err, hash) => {
        if(err) return cb(err);
        if(hash == player.pass) return cb(null, player);
        return cb();
      });
    });
  }
  upgrade(obj, cb) {
    var command = "UPDATE players SET "
    for(var key in obj) {
      if(key == "daylastseen") {
        command += `daylastseen = ${Math.round(Date.now()/1000/60/60/24)},`;
      } else {
        this[key] += obj[key];
        command += `${key} = ${this[key]},`;
      }
    }
    this.lvl = Math.floor(this.score / 10);
    command += `lvl = ${this.lvl}`;
    command += ` WHERE name = "${this.name}"`;
    this.daylastseen = Math.round(Date.now()/1000/60/60/24);
    con.query(command, (err) => {
      if(err) return cb(err);
      cb();
    });
  }
}
module.exports = Player;