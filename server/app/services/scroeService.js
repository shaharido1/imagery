const interSectionMethods = require('./helpers/polygonIntersection');
const config = require('../config/appConfig');

//var polygonsIntersect = require('polygons-intersect');

exports.ScoreService = class {

    constructor() {
        this.targetsHit = [];
        this.bestProportion = config.interSectionPrec;
        this.error = {
            noSize: 0,
            total: 0
        }
    }

    calculateImageScore(trueImage, contestantImage) {
        try {
            const imageClasses = this._getClasses(contestantImage);
            if (!imageClasses) {
                console.log("problem with image " + contestantImage.id);
                return contestantImage
            }
            let precisionAvg = 0;
            imageClasses.forEach(detectionClass => {
                const contestantImageClass = contestantImage.detections.filter(detection => {
                    return detection.detectionClass === detectionClass
                });
                const trueImageClass = trueImage.detections.filter(detection => {
                    return detection.detectionClass === detectionClass
                });
                if (trueImageClass && trueImageClass.length && contestantImageClass && contestantImageClass.length) {
                    const precision =this._calculateForEachClass(contestantImageClass, trueImageClass);
                    precisionAvg+=precision;
                }
                else {
                    console.log("problem with image " + contestantImage.id + "class " + detectionClass)
                }
            });
            contestantImage.imageScore = contestantImage.imageScore || {};
            contestantImage.imageScore.precisionScore = precisionAvg / imageClasses.length;
            return contestantImage
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }


    _getClasses(contestantImage) {
        let imageClasses = [];
        contestantImage.detections.forEach(detection => {
            const detectionClass = imageClasses.find(cla => cla === detection.detectionClass)
            if (!detectionClass) {
                imageClasses.push(detection.detectionClass)
            }
        });
        return imageClasses
    }

    _calculateForEachClass(contestantImageClassDetections, trueImageClass) {
        this.targetsHit = [];
        this.bestProportion = config.interSectionPrec;
        let totalP = 0;
        let totalTrue = 0;
        contestantImageClassDetections.forEach((checkDetection, i) => {
            const trueDetection = this._checkDetection(checkDetection, trueImageClass);
            if (trueDetection) {
                totalTrue++;
                totalP += totalTrue / (i + 1);
            }
        });
        const precisionScore = totalP / trueImageClass.length;
        return precisionScore
    }


    _checkDetection(checkDetection, trueImageDetections) {
        try {
            this.bestProportion = config.interSectionPrec;
            const polygonArea = interSectionMethods.calcPolygonArea(checkDetection.position);
            trueImageDetections.forEach(trueDetection => {
                if (trueDetection.detectionClass == "utility pole") {
                    this._checkPolygonToPoint(checkDetection, trueDetection)
                }
                else {
                    this._checkPolygonToTargets(checkDetection, polygonArea, trueDetection)
                }
            });
            if (checkDetection.hit && checkDetection.hit.isHitTarget) {
                this.targetsHit.push(checkDetection.hit.matchTarget.targetId);
                return trueImageDetections.find(detection=>{return detection.id===checkDetection.hit.matchTarget.targetId})
            }
            else {
                if (!checkDetection.isDoubleHit) {
                    checkDetection.hit = {
                        matchTarget: null,
                        polygonSize: polygonArea,
                        contain: 0,
                        isHitTarget: false,
                        isDoubleHit: false
                    }
                }
                return null
            }
        }
        catch (e) {
            console.log(e);
            console.log("Error")
        }

    }


    _checkPolygonToPoint(checkDetection, trueDetection) {
        const absDistance = interSectionMethods.pointDistance(checkDetection.position[0], trueDetection.position[0])
        if (absDistance < config.minDistance) {
            checkDetection.hit = {
                isDoubleHit: false,
                matchTarget: {
                    targetId: trueDetection.id
                },
                isHitTarget: true,
                polygonSize: absDistance,
                interactionPolygon: null,
                contain: null,
                featureEvl: [],
            };
        }
    }

    _checkPolygonToTargets(checkDetection, polygonArea, trueDetection) {
        const interSection = interSectionMethods.intersect(checkDetection.position, trueDetection.position);
        if (interSection && interSection.length) {
            const targetArea = interSectionMethods.calcPolygonArea(trueDetection.position);
            let totalIntersectionArea = 0;
            interSection.forEach(section => {
                totalIntersectionArea += interSectionMethods.calcPolygonArea(section);
            });
            const unity = polygonArea + targetArea - totalIntersectionArea;
            const proportion = totalIntersectionArea / unity;
            if (proportion > config.interSectionPrec) {
                if (this.targetsHit.find(targetId => targetId === trueDetection.id)) {
                    checkDetection.hit = {
                        isDoubleHit: true,
                        matchTarget: {
                            targetId : trueDetection.id,
                            detectionClass: trueDetection.detectionClass,
                            subClass: trueDetection.subClass,
                            color: trueDetection.color,
                            features:trueDetection.features
                        },
                        isHitTarget: false,
                        interactionPolygon: interSection,
                        polygonSize: polygonArea,
                        contain: proportion,
                        featureEvl: []
                    }
                }
                else {
                    if (proportion > this.bestProportion) {
                        //array need to be cloned..
                        checkDetection.hit = {
                            isDoubleHit: false,
                            matchTarget : {
                                targetId : trueDetection.id,
                                detectionClass: trueDetection.detectionClass,
                                subClass: trueDetection.subClass,
                                color: trueDetection.color,
                                features: JSON.parse(JSON.stringify(trueDetection.features))
                            },
                            isHitTarget: true,
                            polygonSize: polygonArea,
                            interactionPolygon: interSection,
                            contain: proportion
                        };
                        this.bestProportion = proportion
                    }
                }
            }
        }
    }
};