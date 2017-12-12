var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var answerSheet = mongoose.Schema({
    contestantDetails: {
        name: String
    },
    score: {
        numberOfHit: Number,
        numberOfFalse: Number
    },
    images: [String]
});


module.exports = mongoose.model('AnswerSheet', answerSheet);
