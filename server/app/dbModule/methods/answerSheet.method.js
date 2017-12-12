const ScoreService = require("../../services/scroeService").ScoreService
const FileService = require("../../services/fileService").FileService;
const ImageMethods = require("./image").ImageMethods;
const AnswerSheet = require('../schemas/answerSheet');
const Image = require('../schemas/image');

exports.AnswerSheetMethods = class {
    constructor() {
        this.fileService = new FileService();
        this.scoreService = new ScoreService();
        this.imageMethods = new ImageMethods()
    }

    createOrUpdateFromClient(answerSheet) {
        return new Promise((resolve, reject) => {
            try {
                if (!answerSheet || !answerSheet.contestantDetails || !answerSheet.contestantDetails.name) {
                    return reject("Empty object")
                }
                else {
                    const participant = {
                        contestantDetails: {
                            name: answerSheet.contestantDetails.name
                        },
                        score: {
                            numberOfHit: 0,
                            numberOfFalse: 0
                        },
                        images: []
                    };
                    AnswerSheet.findOneAndUpdate({"contestantDetails.name": answerSheet.contestantDetails.name}, participant, {
                            upsert: true,
                            returnNewDocument: true
                        }, (err, participant) => {
                            if (err) {
                                reject(err)
                            }
                            if (participant) {
                                console.log(" participant created-> creating images");
                                this.imageMethods.createImages(answerSheet, participant._id)
                                    .then(insertedIds => {
                                        participant.imgaes = insertedIds;
                                        participant.save().then(() => {
                                            console.log("images inserted to participant");
                                            return resolve(participant)
                                        })
                                    })
                                    .catch(err => {
                                        console.log(err)
                                        return reject(err)
                                    })
                            }
                            else {
                                return reject("participant wasn't created")
                            }
                        }
                    )
                }
            }
            catch
                (e) {
                console.log(e)
            }
        })

    }


    createFromServer(name, path) {
        try {
            return new Promise((resolve, reject) => {
                let answerSheet = {};
                answerSheet.contestantDetails = {
                    name: name
                };
                this.fileService.getDataFromFile(path).then(sheet => {
                    answerSheet.sheet = sheet;
                    AnswerSheet.findOneAndUpdate({"contestantDetails.name": name}, answerSheet, {
                        upsert: true,
                        returnNewDocument: true
                    }, function (err, answerSheet) {
                        if (err) {
                            console.log(err)
                            return reject(err)
                        }
                        else {
                            return resolve(answerSheet)
                        }
                    })
                }).catch(err => {
                    console.log(err)
                })
            })
        }
        catch (e) {
            console.log(e)
        }
    }

    getPraticipants(query, select) {
        return new Promise((resolve, reject) => {
            AnswerSheet.find(query).select(select).exec((err, result) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(result)
                }
            })

        })
    }

    calculateScore(name) {
        return new Promise((resolve, reject) => {
            try {
                if (!name) {
                    return
                }
                AnswerSheet.find({$or: [{"contestantDetails.name": "true_results"}, {"contestantDetails.name": name}]}, (err, result) => {
                    if (err) {
                        console.log(err);
                        return reject(err)
                    }
                    const trueSheet = result.find(par => par.contestantDetails.name === "true_results");
                    let contestantSheet = result.find(par => par.contestantDetails.name === name);
                    if (!contestantSheet) {
                        return reject("no such participant")
                    }
                    let promises = [];
                    console.log("getting images")
                    promises.push(this.imageMethods.getAllImage(trueSheet._id));
                    promises.push(this.imageMethods.getAllImage(contestantSheet._id));
                    Promise.all(promises).then(results => {
                        console.log("got all images")
                        const trueImages = results[0];
                        let contestantImages = results[1];
                        let sheetTotal = {
                            numberOfHit: 0,
                            numberOfFalse: 0
                        };
                        contestantImages.forEach(contestantImage => {
                            try {
                                const trueImage = trueImages.find(image => {
                                    return image.imageId === contestantImage.imageId
                                });
                                console.log("checking image" + contestantImage.imageId)

                                contestantImage = this.scoreService.calculateImageScore(trueImage, contestantImage);
                            }
                            catch (e) {
                                console.log("problem with image " + contestantImage.imageId);
                                console.log(e)
                            }
                            sheetTotal.numberOfHit += contestantImage.imageScore.numberOfHit;
                            sheetTotal.numberOfFalse += contestantImage.imageScore.numberOfFalse;
                        });
                        console.log("done calculating -> saving images");
                        this.imageMethods.saveImages(contestantImages).then(() => {
                            contestantSheet.score = sheetTotal;
                            contestantSheet.save().then(() => {
                                console.log("total saved in participant");
                                resolve(contestantSheet.score)
                            }).catch(err => {
                                console.log(err)
                                return reject(err)
                            })
                        }).catch(err => {
                            console.log(err)
                            return reject(err)
                        })
                    }).catch(err => {
                        console.log(err);
                        return reject(err)
                    })
                })
            }
            catch (e) {
                return reject(e)
            }
        })
    }

};
