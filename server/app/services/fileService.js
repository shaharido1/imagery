const features = require('../config/features');
const csv = require('csvtojson');

exports.FileService = class {



    getDetectionFeatures(features, detection) {
        let detectionFeatures = {};
        features.forEach(feature => {
            detectionFeatures[feature] = detection[feature] && detection[feature] === "1";
        });
        return detectionFeatures
    }

    findOrPush(sheet, detection) {
        let index = sheet.findIndex(image => image.imageId === detection["Image_id"]);
        if (index < 0) {
            sheet.push({
                imageId: detection["Image_id"],
                detections: []
            });
            index = sheet.length - 1;
        }
        return index
    }

    getDataFromFile(path) {
        return new Promise(function (resolve, reject) {
            let sheet = [];
            csv()
                .fromFile(path)
                .on('json', (detection) => {
                    const detectionFeatures = this.getDetectionFeatures(features, detection);
                    const index = this.findOrPush(sheet, detection);
                    sheet[index].detections.push({
                        detectionClass: detection.Class,
                        subClass: detection.SubClass,
                        position: [
                            {x: detection.P1_X, y: detection.P1_Y},
                            {x: detection.P2_X, y: detection.P2_Y},
                            {x: detection.P3_X, y: detection.P3_Y},
                            {x: detection.P4_X, y: detection.P4_Y}
                        ],
                        color: detection.Color,
                        features: detectionFeatures,
                        id: detection.Id
                    })
                })
                .on('done', (err) => {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        return resolve(sheet)
                    }
                })
        })
    }
}