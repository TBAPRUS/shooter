exports.game = (req, res) => {
  if(res.locals.player) {
    exports.name = res.locals.player.name;
  }
  res.render('game');
}