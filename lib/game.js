const server = require('../http');
const Player = require('../models/player');
var io = require('socket.io');

var stat = {};
var log = {messages: []};
var upgradeStat;
const GENBULLET = 10;
const WIDTHBULLET = 5;
const HEIGHTBULLET = 5;
var state = {
  WIDTHBULLET: WIDTHBULLET,
  HEIGHTBULLET: HEIGHTBULLET,
  walls: [],
  bullets: [],
  players: {},
  canvasW: 500,
  canvasH: 500
};

function upgradeStat(name, owner) {
  Player.getByName(owner, (err, player) => {
    if(err) throw err;
    player.upgrade({money: 1, score: 1}, (err) => {
      if(err) throw err;
      Player.getByName(name, (err, player2) => {
        if(err) throw err;
        log.messages.push(`${owner}[${player.lvl}] kills ${name}[${player2.lvl}]`);
      });
      Player.getByName(owner, (err, player) => {
        if(err) throw err;
        stat = {name: owner, score: player.score, lvl: player.lvl, money: player.money};
      });
    });
  });
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function overlay(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 <= x2 + w2 &&
         x1 + w1 >= x2 &&
         y1 <= y2 + h2 &&
         y1 + h1 >= y2;
}

module.exports = () => {
  io = io(server);
  io.on('connection', function (socket) {
    const name = require('../routes/game').name;
    if(name) {
      socket.emit('name', name);
      Player.getByName(name, (err, player) => {
        if(err) throw err;
        socket.emit('cost', {
          upmax: player.upmax,
          upspeed: player.upspeed,
          upspeedbullet: player.upspeedbullet,
          upvisibility: player.upvisibility,
          money: player.money
        });
        state.players[name] = {
          alive: true,
          x: random(1, 479),
          y: random(1, 479),
          w: 20,
          h: 20,
          mouse: {
            x: 0,
            y: 0,
            deg: 0
          },
          max: 200 + player.upmax * 20,
          speed: 2 + player.upspeed * 0.2,
          speedbullet: 5 + player.upspeedbullet * 0.5,
          visibility: 200 + player.upvisibility * 20
        };
        log.messages.push(`${name} присоединился.`);
      });
      
    }

    socket.on('go', function(data) {
      if(state.players[name]) {
        direct = data.direct;
        var speed = state.players[name].speed;
        if(state.players[name]) {
          if(direct.up && state.players[name].y > 0) {
            state.players[name].y -= speed;
          }
          if(direct.left && state.players[name].x > 0) {
            state.players[name].x -= speed;
          }
          if(direct.down && state.players[name].y + state.players[name].h < state.canvasH) {
            state.players[name].y += speed;
          }
          if(direct.rigth && state.players[name].x + state.players[name].w < state.canvasW) {
            state.players[name].x += speed;
          }
        }
      }
    });

    socket.on('see', function(data) {
      if(state.players[name]) {
        var e = data.e;
        var rect = data.rect;
        var mouse = {
          x: e.offsetX - (state.players[name].x + state.players[name].w / 2),
          y: e.offsetY - (state.players[name].y + state.players[name].h / 2),
        };
        if(e.offsetY <= state.players[name].y + state.players[name].h / 2) {
          mouse.deg = -Math.atan(mouse.x / mouse.y);
        } else {
          mouse.deg = -Math.atan(mouse.x / mouse.y) + Math.PI; //180 * Math.PI / 180
        }
        if(mouse.x > 0) {
          if(mouse.deg == -90 * Math.PI / 180) {
            mouse.deg = 1.57079632; // 90
          }
        }
        if(mouse.x < 0) {
          if(mouse.deg == 90 * Math.PI / 180) {
            mouse.deg = -1.57079632; // 90
          }
        }
        state.players[name].mouse = mouse;
      }
    });

    socket.on('fire', function(data) {
      var shoot = data.shoot;
      if(shoot && state.players[name]) {
        var relationxy = Math.abs(state.players[name].mouse.x / state.players[name].mouse.y);
        var relationyx = Math.abs(state.players[name].mouse.y / state.players[name].mouse.x);
        relationxy = relationxy > 1 ? 1 : relationxy;
        relationxy = relationxy <-1 ? -1 : relationxy;
        relationyx = relationyx > 1 ? 1 : relationyx;
        relationyx = relationyx <-1 ? -1 : relationyx;
        var y = state.players[name].mouse.y < 0 ? -1 : 1;
        var x = state.players[name].mouse.x < 0 ? -1 : 1;
        var min = 0;
        if(state.players[name].mouse.deg * 180 / Math.PI >= 225 || state.players[name].mouse.deg * 180 / Math.PI <= 45) {
          min = -WIDTHBULLET - 0;
        }
        state.bullets.push({
          owner: name,
          deg: state.players[name].mouse.deg,
          relationxy: relationxy,
          relationyx: relationyx,
          dx: x,
          dy: y,
          x: state.players[name].x + state.players[name].w / 2 + x * relationxy * GENBULLET + min,
          y: state.players[name].y + state.players[name].h / 2 + y * relationyx * GENBULLET + min,
          current: 0
        });
      }
    });

    socket.on('respawn', () => {
      state.players[name].alive = true;
      state.players[name].x = random(1, 479);
      state.players[name].y = random(1, 479);
      /*
      state.players[name] = {
        alive: true,
        x: random(1, 479),
        y: random(1, 479),
        w: 20,
        h: 20,
        mouse: {
          x: 0,
          y: 0,
          deg: 0
        },
        max: 200 + player.upmax * 20,
        speed: 2 + player.upspeed * 0.2,
        speedbullet: 5 + player.upspeedbullet * 0.5,
        visibility: 200 + player.upvisibility * 20
      };
      */
    });

    socket.on('input', (value) => {
      log.messages.push(value);
    });

    socket.on('buy', (upName) => {
      Player.getByName(name, (err, player) => {
        if(err) throw err;
        var cost = (player[upName] + 1) * 100;
        if(player[upName] < 5) {
          if(player.money > cost) {
            var list = {};
            list.money = -cost;
            list[upName] = 1;
            player.upgrade(list, (err) => {
              if(err) throw err;
              Player.getByName(name, (err, player) => {
                if(err) throw err;
                socket.emit('cost', {
                  upmax: player.upmax,
                  upspeed: player.upspeed,
                  upspeedbullet: player.upspeedbullet,
                  upvisibility: player.upvisibility,
                  money: player.money
                });
                state.players[name].max = 200 + player.upmax * 20;
                state.players[name].speed = 2 + player.upspeed * 0.2;
                state.players[name].speedbullet = 5 + player.upspeedbullet * 0.5;
                state.players[name].visibility = 200 + player.upvisibility * 20;
              });
            });
          }
        }
      });
    });

    socket.on('disconnect', (reason) => {
      delete state.players[name];
      log.messages.push(`${name} ушёл.`);
    });
  });

  var tick = setInterval(function() {
    state.bullets = state.bullets.filter((bullet) => {
      return !(bullet.x > state.canvasW ||
            bullet.x < 0 ||
            bullet.y > state.canvasH ||
            bullet.y < 0);
    });
    for(var i = 0; i < state.bullets.length; i++) {
      var bullet = state.bullets[i];
      for(var name in state.players) {
        var player = state.players[name];
        if(bullet.owner != name && state.players[name].alive) {
          if(overlay(bullet.x, bullet.y, WIDTHBULLET, HEIGHTBULLET, player.x, player.y, player.w, player.h)) {
            upgradeStat(name, bullet.owner);
            state.players[name].alive = false;
          }
        }
      }
    }
    for(var i = 0; i < state.bullets.length; i++) {
      if(state.players[bullet.owner]) {
        var bullet = state.bullets[i];
        var speedbullet = state.players[bullet.owner].speedbullet;
        state.bullets[i].x = bullet.x + speedbullet * bullet.dx * bullet.relationxy;
        state.bullets[i].y = bullet.y + speedbullet * bullet.dy * bullet.relationyx;
        state.bullets[i].current += Math.sqrt(Math.pow(Math.abs(speedbullet * bullet.dx * bullet.relationxy), 2) +
                                    Math.pow(Math.abs(speedbullet * bullet.dy * bullet.relationyx), 2));
        if(state.bullets[i].current > state.players[bullet.owner].max) {
          state.bullets.splice(i, 1);
        }
      } else {
        state.bullets.splice(i, 1);
      }
    }
    io.emit('data', { state: state });
    if(log.messages.length > 0) {
      io.emit('log', log);
      log.messages = [];
    }
    if(stat.name) {
      io.emit('stat', stat);
      stat = {};
    }
  }, 1000/24);
};