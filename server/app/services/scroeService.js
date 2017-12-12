const interSectionMethods = require('./helpers/polygonIntersection');
const config = require('../config/appConfig');

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
            this.targetsHit = [];
            this.bestProportion = config.interSectionPrec;
            this.error.noSize = 0;
            contestantImage.detections.forEach(checkDetection => {
                this.checkDetection(checkDetection, trueImage)
            });
            contestantImage.imageScore = {
                numberOfHit: this.targetsHit.length,
                numberOfFalse: contestantImage.detections.length - this.targetsHit.length
            };
            return contestantImage
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }


    checkDetection(checkDetection, trueImage) {
        try {
            this.bestProportion = config.interSectionPrec;
            const polygonArea = interSectionMethods.calcPolygonArea(checkDetection.position);
            trueImage.detections.forEach(trueDetection => {
                if (trueDetection.detectionClass == "utility pole") {
                    this.checkPolygonToPoint(checkDetection, trueDetection)
                }
                else {
                    this.checkPolygonToTargets(checkDetection, polygonArea, trueDetection)
                }
            });
            if (checkDetection.hit && checkDetection.hit.isHitTarget) {
                this.targetsHit.push(checkDetection.hit.targetId);
            }
            else {
                checkDetection.hit = {
                    targetId: null,
                    polygonSize: polygonArea,
                    contain: 0,
                    isHitTarget: false,
                    isDoubleHit: false
                }
            }
        }
        catch (e) {
            console.log(e);
            console.log("Error")
        }

    }

    createError(checkDetection, err) {
        checkDetection.hit = {
            targetId: null,
            polygonSize: null,
            contain: 0,
            isHitTarget: false,
            isDoubleHit: false,
            error: err
        };
        switch (err) {
            case "no size to polygon" : {
                this.error.noSize++;
                this.error.total++
                break;
            }
        }
    }

    checkPolygonToPoint(checkDetection, trueDetection) {
        if (interSectionMethods.pointDistance(checkDetection.position[0], trueDetection.position[0])) {
            checkDetection.hit = {
                isDoubleHit: false,
                targetId: trueDetection.id,
                isHitTarget: true,
                polygonSize: null,
                interactionPolygon: null,
                contain: null
            };
        }
    }

    checkPolygonToTargets(checkDetection, polygonArea, trueDetection) {
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