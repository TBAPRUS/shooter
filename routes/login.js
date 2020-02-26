var Player = require('../models/player');
exports.form = (req, res) => {
  res.render('login');
};
exports.submit = (req, res, next) => {
  var data = req.body.player;
  Player.authenticate(data.name, data.pass, (err, player) => {
    if(err) return next(err);
    if(player) {
      player.upgrade({daylastseen: 0}, (err) => {
        if(err) return next(err);
        req.session.uid = player.id;
        res.redirect('/');
      });
    } else {
      res.error('Неверные учётные данные.');
      res.redirect('back');
    }
  });
};
exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if(err) return next(err);
    res.redirect('/');
  });
};