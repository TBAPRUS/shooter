exports.password = (req, res, next) => {
  var pass = req.body.player.pass;
  var reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,24}$/;
  if(reg.test(pass)) {
    next();
  } else {
    res.error('Пароль должен содержать от 6 до 24 символов, не менее одной цифры, одной заглавной и одной строчной буквы на латинице.');
    res.redirect('back')
  }
};
exports.name = (req, res, next) => {
  var name = req.body.player.name;
  var reg = /^[a-zA-Z]{3,24}$/;
  if(reg.test(name)) {
    next();
  } else {
    res.error('Имя должно содержать от 4 до 24 символов на латинице.');
    res.redirect('back');
  }
};