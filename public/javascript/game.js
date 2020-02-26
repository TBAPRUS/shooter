(() => {
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');
const rect = canvas.getBoundingClientRect();
const sendButton = document.querySelector('form button');
const upButton = document.querySelectorAll('.upgrade button');
const upText = document.querySelectorAll('.upgrade p');
const textarea = document.querySelector('textarea');
const input = document.querySelector('input');
var cost = {};
var money = 0;
var pastMessage = '';
var respawn = false;
var state;
/*
var fps = 0;
var ping = 0;
var dateFPS = new Date().getSeconds();
var datePING = new Date().getSeconds();
*/
var direct = {
  left: false,
  rigth: false,
  up: false,
  down: false
};
var shoot = false;
var socket = io.connect('http://localhost:3000/');
socket.on('name', (data) => {
  name = data;
});
socket.on('cost', (data) => {
  money = data.money;
  document.querySelector("#money").innerText = "money: " + money;
  for(var text of upText) {
    if(data[text.className] < 5) {
      cost[text.className] = (data[text.className] + 1) * 100;
      text.innerText = `Цена ${(data[text.className] + 1) * 100} монет`;
    } else {
      cost[text.className] = -1;
      text.innerText = `Вы купили все улучшения`;
    }
  }
});
socket.on('data', (data) => {
  /*
  if(datePING != new Date().getSeconds()) {
    datePING = new Date().getSeconds();
    console.log("ping: " + ping);
    ping = 0;
  } else {
    ping += 1;
  }
  */
  if(!state) {
    state = data.state;
    canvas.width = '500';
    canvas.height = '500';
    requestAnimationFrame(render);
  } else {
    state = data.state;
  }
});
socket.on('log', (logs) => {
  for(var log of logs.messages) {
    textarea.value += log + "\n";
  }
})
socket.on("stat", (stat) => {
  if(stat.name == name) {
    money = stat.money;
    document.querySelector("#score").innerText = "score: " + stat.score;
    document.querySelector("#lvl").innerText = "lvl: " + stat.lvl;
    document.querySelector("#money").innerText = "money: " + stat.money;
  }
});
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 37 || event.keyCode == 65) {
    direct.left = true; // left
  }
  if(event.keyCode == 39 || event.keyCode == 68) {
    direct.rigth = true; // right
  }
  if(event.keyCode == 38 || event.keyCode == 87) {
    direct.up = true; // up
  }
  if(event.keyCode == 40 || event.keyCode == 83) {
    direct.down = true; // down
  }
  if(state.players[name].alive) {
    socket.emit('go', { direct: direct, name: name });
  }
});
document.addEventListener('keyup', function(event) {
  if(event.keyCode == 37 || event.keyCode == 65) {
    direct.left = false; // left
  }
  if(event.keyCode == 39 || event.keyCode == 68) {
    direct.rigth = false; // right
  }
  if(event.keyCode == 38 || event.keyCode == 87) {
    direct.up = false; // up
  }
  if(event.keyCode == 40 || event.keyCode == 83) {
    direct.down = false; // down
  }
  if(state.players[name].alive) {
    socket.emit('go', { direct: direct, name: name });
  }
});
canvas.addEventListener('mousemove', function(e) {
  if(state.players[name].alive) {
    socket.emit('see', { name: name, e: { offsetX: e.offsetX, offsetY: e.offsetY }, rect: rect});
  }
});
canvas.addEventListener('mousedown', function(e) {
  e.preventDefault();
  shoot = true;
  if(state.players[name].alive) {
    socket.emit('fire', {shoot: shoot, name: name });
  }
});
canvas.addEventListener('mouseup', function(e) {
  shoot = false;
  if(state.players[name].alive) {
    socket.emit('fire', {shoot: shoot, name: name });
  }
});
sendButton.addEventListener('click', (e) => {
  e.preventDefault();
  input.blur();
  value = input.value;
  if(value.length < 2) {
    textarea.value += "Ваши сообщения должны быть длиннее, чем 1 символ." + "\n";
  } else if(value == pastMessage) {
    textarea.value += "Ваши сообщения не должны повторяться." + "\n";
  } else if(value.length > 200) {
    textarea.value += "Ваши сообщения должны быть короче, чем 200 символ." + "\n";
  } else {
    value = `${name}: ${input.value}`;
    socket.emit('input', value);
    pastMessage = value;
    input.value = '';
  }
});
for(var button of upButton) {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    if(money < cost[e.target.className]) {
      textarea.value += "У вас не хватает денег." + "\n";
    } else if(cost[e.target.className] == -1) {
      textarea.value += "Вы купили все улучшения." + "\n";
    } else {
      socket.emit('buy', e.target.className);
    }
  });
}
function render() {
  if(state.players[name]) {
    if(state.players[name].alive) {
      /*
      if(dateFPS != new Date().getSeconds()) {
        dateFPS = new Date().getSeconds();
        console.log("fps: " + fps);
        fps = 0;
      } else {
        fps += 1;
      }
      */
      ctx.clearRect(-1000,-1000,2000,2000);
      ctx.fillStyle = "#222222";
      for(var key in state.players) {
        if(state.players[key].alive) {
          ctx.fillRect(state.players[key].x,state.players[key].y,state.players[key].w,state.players[key].h)
        }
      }
      for(var bullet of state.bullets) {
        ctx.fillRect(bullet.x,bullet.y,state.WIDTHBULLET,state.HEIGHTBULLET)
      }
      ctx.fillStyle = '#AAAAAA';
      ctx.translate(state.players[name].x+state.players[name].w/2,state.players[name].y+state.players[name].h/2);
      ctx.rotate(state.players[name].mouse.deg + 1.308996938); // Math.PI / 180 * 75
      ctx.fillRect(-1000, 0, 2000, 1000);
      ctx.resetTransform();
      ctx.translate(state.players[name].x+state.players[name].w/2,state.players[name].y+state.players[name].h/2);
      ctx.rotate(state.players[name].mouse.deg - 1.308996938); // Math.PI / 180 * 75
      ctx.fillRect(-1000, 0, 2000, 1000);
      ctx.resetTransform();
      ctx.translate(state.players[name].x+state.players[name].w/2,state.players[name].y+state.players[name].h/2);
      ctx.rotate(state.players[name].mouse.deg);
      ctx.fillRect(-1000, -state.players[name].visibility, 2000, -1000);
      ctx.resetTransform();
      ctx.fillStyle = "#222222";
      ctx.fillRect(state.players[name].x,state.players[name].y,state.players[name].w,state.players[name].h);
      respawn = false;
    } else if(!respawn) {
      console.log('respawn')
      socket.emit('respawn');
      respawn = true;
    }
    requestAnimationFrame(render);
  } else {
    window.location.reload();
  }
}
})();