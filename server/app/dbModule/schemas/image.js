var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var image = mongoose.Schema({
    imageId: String,
    participantId: String,
    imageScore: {
        precisionScore: Number,
    },
    detections: [{
        detectionClass: String,
        subClass: String,
        features: [string],
        position: [{x: Number, y: Number}],
        color: String,
        id: String,
        hit: {
            targetId: String,
            polygonSize: Number,
            featureEvl: [{featureName: String, kapaScore: number}],
            contain: Number,
            interactionPolygon: [[{x: Number, y: Number}]],
            isDoubleHit: Boolean,
            isHitTarget: Boolean,
            error: String,

        }
    }]
});


module.exports = mongoose.model('Image', image);
