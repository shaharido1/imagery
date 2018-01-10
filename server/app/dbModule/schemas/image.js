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
        features: [String],
        position: [{x: Number, y: Number}],
        color: String,
        id: String,
        hit: {
            matchTarget: {
                targetId : String,
                detectionClass: String,
                subClass: String,
                color: String,
                features: [String]
            },
            polygonSize: Number,
            featureEvl: [{featureName: String, kapaScore: Number}],
            contain: Number,
            interactionPolygon: [[{x: Number, y: Number}]],
            isDoubleHit: Boolean,
            isHitTarget: Boolean,
            error: String,

        }
    }]
});


module.exports = mongoose.model('Image', image);
