const Player = require('../models/player');
module.exports = (req, res, next) => {
  const uid = req.session.uid;
  if(!uid) return next();
  Player.getById(uid, (err, player) => {
    if(err) return next(err);
    req.player = res.locals.player = player;
    next();
  });
}