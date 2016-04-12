var mongoose = require('mongoose');
var MatchSchema = new mongoose.Schema({
  username: String,
  games: [{sign: Number, signOpponent: Number, numSwitches: Number, timeForDecision: Number, result: Number}]
});
mongoose.model('Match', MatchSchema);

var UserSchema = new mongoose.Schema({
username: String,
password: String,
matches: {type: Number, default: 0}
});
UserSchema.methods.increment = function(cb) {
  this.matches += 1;
  this.save(cb);
};
mongoose.model('User', UserSchema);
