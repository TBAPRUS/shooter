var Player = require('../models/player');
exports.form = (req, res) => {
  res.render('register');
};
exports.submit = (req, res, next) => {
  var data = req.body.player;
  Player.getByName(data.name, (err, player) => {
    if(err) return next(err);
    if(player) {
      res.error('Имя уже занято.');
      res.redirect('back');
    } else {
      player = new Player({
        name: data.name,
        pass: data.pass
      });
      player.register((err) => {
        if(err) return next(err);
        req.session.uid = player.id;
        res.redirect('/');
      });
    }
  });
}