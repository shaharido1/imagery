const csv = require('csvtojson');
import {features} from './features';

const $ = require('jquery');


export class ProcessFile {

    static parseData(detections) {
        let sheet = [];
        detections.forEach(detection => {
            const detectionFeatures = ProcessFile.getDetectionFeatures(features, detection);
            const index = ProcessFile.findOrPush(sheet, detection);
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
        return sheet
    }

    static getDetectionFeatures(features, detection) {
        let detectionFeatures = {};
        features.forEach(feature => {
            detectionFeatures[feature] = detection[feature] && detection[feature] === "1";
        });
        return detectionFeatures
    }


    static findOrPush(sheet, detection) {
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
}