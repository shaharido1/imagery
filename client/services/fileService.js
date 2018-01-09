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
                error(err) {
                    console.log(err)
                    return reject(err)
                }
            })
        })
    };

    static parseData(detections) {
        let sheet = [];
        detections.forEach(detection => {
            const index = FileService.findOrPush(sheet, detection);
            if (detection.Class && detection.Id) {
                sheet[index].detections.push({
                    detectionClass: detection.Class.toLowerCase(),
                    subClass: detection.Subclass.toLowerCase() || "",
                    position: [
                        {x: detection.P1_X, y: detection.P1_Y},
                        {x: detection.P2_X, y: detection.P2_Y},
                        {x: detection.P3_X, y: detection.P3_Y},
                        {x: detection.P4_X, y: detection.P4_Y}
                    ],
                    color: detection.Color,
                    features: FileService.getDetectionFeatures(features, detection),
                    id: detection.Id
                })
            }
            else {
                console.log("error with detection" + detection.Id)
            }
        })
        return sheet
    }

    static getDetectionFeatures(features, detection) {
        let detectionFeatures = [];
        features.forEach(feature => {
            if (detection[feature] && detection[feature] === "1") {
                detectionFeatures.push(feature.replace(/ /g,"_").toLowerCase())
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