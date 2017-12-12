const Image = require('../schemas/image');

exports.ImageMethods = class {

    createImages(answerSheet, participantId) {
        return new Promise((resolve, reject) => {
            let toUpdate = [];
            answerSheet.sheet.forEach(image => {
                if (image && image.imageId) {
                    const document = {
                        imageId: image.imageId,
                        participantId: participantId,
                        imageScore: {
                            numberOfHit: 0,
                            numberOfFalse: 0
                        },
                        detections: image.detections || []
                    };
                    toUpdate.push({insertOne: {document}});
                }
            });
            if (!toUpdate) {
                console.log("nothing to update");
                return reject()
            }
            console.log("writing images")
            Image.bulkWrite(toUpdate).then((results) => {
                console.log("images created")
                return resolve(results.insertedIds)
            })
        })
    }
    saveImages(contestantImages) {
        return new Promise((resolve, reject) => {
            let toUpdate = [];
            contestantImages.forEach(image => {
                if (image && image.imageId) {
                    const update = image.toObject();
                    const filter ={
                        _id: image._id,
                    };
                    toUpdate.push({updateOne: {update, filter}});
                }
            });
            if (!toUpdate) {
                console.log("nothing to update");
                return reject()
            }
            console.log("updating images");
            Image.bulkWrite(toUpdate).then((results) => {
                console.log("images updated");
                return resolve()
            })
        })
    }


    getAllImage(participantId) {
        return new Promise((resolve, reject) => {
            Image.find({participantId: participantId}, (err, images) => {
                if (err) {
                    return reject(err)
                }
                if (images) {
                    return resolve(images)
                }
            })
        })
    }


    getImageById(imageId) {
        return new Promise((resolve, reject) => {
            Image.findOne({"_id": imageId}, (err, image) => {
                if (err) {
                    return reject(err)
                }
                if (image) {
                    return resolve(image)
                }
            })
        })
    }

    getImageByExternalId(imageExternalId, participantId) {
        return new Promise((resolve, reject) => {
            Image.findOne({$and: [{"participantId": participantId}, {"imageId": imageExternalId}]}, (err, image) => {
                if (err) {
                    return reject(err)
                }
                if (image) {
                    return resolve(image)
                }
                else {
                    return reject("no such image")
                }
            })
        })

    }
};
