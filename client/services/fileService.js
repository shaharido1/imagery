const csv = require('csvtojson');
import {features} from '../hardCodedData/features';

const $ = require('jquery');
const papa = require('papaparse');


export class FileService {
    createAnswerSheet(file) {
        return new Promise((resolve, reject) => {
            papa.parse(file, {
                header: true,
                complete(results) {
                    return resolve(FileService.parseData(results.data))
                },
                error(err){
                    console.log(err)
                    return reject(err)
                }
            })
        })
    };

    static parseData(detections) {
        let sheet = [];
        detections.forEach(detection => {
            const detectionFeatures = FileService.getDetectionFeatures(features, detection);
            const index = FileService.findOrPush(sheet, detection);
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
            if (detection[feature] && detection[feature] === "1")  {
                detectionFeatures[feature] = true
            }
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