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
        this.cantIntersect = [];
    }

    calculateImageScore(trueImage, contestantImage) {
        try {
            const imageClasses = this._getClasses(contestantImage);
            if (!imageClasses) {
                console.log("problem with image " + contestantImage.id)
                return contestantImage
            }
            let sumAvg = 0;
            imageClasses.forEach(detectionClass => {
                const contestantImageClass = contestantImage.detections.filter(detection => {
                    return detection.detectionClass === detectionClass
                });
                const trueImageClass = trueImage.detections.filter(detection => {
                    return detection.detectionClass === detectionClass
                });
                if (trueImageClass && trueImageClass.length && contestantImageClass && contestantImageClass.length) {
                    sumAvg += this._calculateForEachClass(contestantImageClass, trueImageClass)
                }
                else {
                    console.log("problem with image " + contestantImage.id + "class " + detectionClass)
                }
            });
            contestantImage.imageScore = contestantImage.imageScore || {};
            contestantImage.imageScore.precisionScore = sumAvg / imageClasses.length;
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
        })
        return imageClasses
    }

    _calculateForEachClass(contestantImageClassDetections, trueImageClass) {
        this.targetsHit = [];
        this.bestProportion = config.interSectionPrec;
        let totalP = 0;
        let totalTrue = 0;
        contestantImageClassDetections.forEach((checkDetection, i) => {
            if (this._checkDetection(checkDetection, trueImageClass)) {
                totalTrue++;
                totalP += totalTrue / (i + 1)
            }
        });
        return totalP / contestantImageClassDetections.length
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
                this.targetsHit.push(checkDetection.hit.targetId);
                return true
            }
            else {
                if (!checkDetection.isDoubleHit) {
                    checkDetection.hit = {
                        targetId: null,
                        polygonSize: polygonArea,
                        contain: 0,
                        isHitTarget: false,
                        isDoubleHit: false
                    }
                }
                return false
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
                targetId: trueDetection.id,
                isHitTarget: true,
                polygonSize: absDistance,
                interactionPolygon: null,
                contain: null
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
            const unity = polygonArea + targetArea;
            const proportion = totalIntersectionArea / unity;
            if (proportion > config.interSectionPrec) {
                if (this.targetsHit.find(targetId => targetId === trueDetection.id)) {
                    checkDetection.hit = {
                        isDoubleHit: true,
                        targetId: trueDetection.id,
                        isHitTarget: false,
                        interactionPolygon: interSection,
                        polygonSize: polygonArea,
                        contain: proportion
                    }
                }
                else {
                    if (proportion > this.bestProportion) {
                        checkDetection.hit = {
                            isDoubleHit: false,
                            targetId: trueDetection.id,
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