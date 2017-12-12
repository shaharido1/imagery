var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var image = mongoose.Schema({
    imageId: String,
    participantId: String,
    imageScore: {
        numberOfHit: Number,
        numberOfFalse: Number
    },
    detections: [{
        detectionClass: String,
        subClass: String,
        features: Object,
        position: [{x: Number, y: Number}],
        color: String,
        id: String,
        hit: {
            targetId: String,
            polygonSize: Number,
            contain: Number,
            interactionPolygon: [[{x: Number, y: Number}]],
            isDoubleHit: Boolean,
            isHitTarget: Boolean,
            error: String,

        }
    }]
});


module.exports = mongoose.model('Image', image);
