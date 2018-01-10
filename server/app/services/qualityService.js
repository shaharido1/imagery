const features = require('../config/features');
const Kappa = require('./helpers/kappa').Kappa;

exports.QualityService = class {
    constructor() {
    }

    nullifay(detectionClass) {
        this.aggregatedFeatureArr = [];
        this.subClassKappaMetrix = Kappa.creatKappaObjFromArray(features[detectionClass].subClass);
        this.ColorKappaMetrix = Kappa.creatKappaObjFromArray(features[detectionClass].colors);
        this.aggregatedFeatureArr = features[detectionClass].features.map(feature => {
            return {
                featureName: feature, kappa: new Kappa()
            }
        })
    }

    getClassScore(classDetections, className) {
        this.nullifay(className);
        classDetections.forEach(detection => {
            this._aggregateScoreFromFeatures(detection);
        });
        return this._getQualityScore()
    }

    _aggregateScoreFromFeatures(checkDetection) {
        //multi category kappa's
        if (checkDetection.hit.matchTarget.subClass &&
            checkDetection.hit.matchTarget.color &&
            this.subClassKappaMetrix.matretion[checkDetection.hit.matchTarget.subClass] &&
            this.ColorKappaMetrix.matretion[checkDetection.hit.matchTarget.color]
        ) {
            this.subClassKappaMetrix.matretion[checkDetection.hit.matchTarget.subClass][checkDetection.subClass]++;
            this.ColorKappaMetrix.matretion[checkDetection.hit.matchTarget.color][checkDetection.color]++;
        }

        //true positive && false positive
        let mutualFeatures = [];
        if (checkDetection.features && checkDetection.features.length) {
            checkDetection.features.forEach(testFeature => {
                const index = this.aggregatedFeatureArr.findIndex(feat => feat.featureName === testFeature);
                if (index >= 0) {
                    const mutual = checkDetection.hit.matchTarget.features.find(trueFeature => trueFeature === testFeature);
                    if (mutual) {
                        mutualFeatures.push(mutual);
                        this.aggregatedFeatureArr[index].kappa.trueFeature.positive++;
                    }
                    else {
                        this.aggregatedFeatureArr[index].kappa.falseFeature.positive++;
                    }
                }
                else {
                    console.log("feature doesn't exist in the class feature list - detection:" + checkDetection.id)
                }
            });
        }

        //false negative
        if (checkDetection.hit.matchTarget.features && checkDetection.hit.matchTarget.features.length) {
            checkDetection.hit.matchTarget.features
                .filter(feature => {
                        if (mutualFeatures && mutualFeatures.length) {
                            return mutualFeatures.find(mutFeature => mutFeature === feature)? false : true
                        }
                    }
                )
                .forEach(feature => {
                    const index = this.aggregatedFeatureArr.findIndex(feat => feat.featureName === feature);
                    index<0? console.log("target feature doesn't match the list") : this.aggregatedFeatureArr[index].kappa.falseFeature.negative++;

                });

        }

        //true negative
        if (this.aggregatedFeatureArr && this.aggregatedFeatureArr.length) {
            this.aggregatedFeatureArr
                .filter(featureObj => {
                    return (!checkDetection.hit.matchTarget.features.find(fea => fea === featureObj.name) &&
                        !checkDetection.features.find(fea => fea === featureObj.name)
                    )
                }).forEach(featureObj => {
                featureObj.kappa.trueFeature.negative++
            });
        }

    }


    _getQualityScore() {
        let avg = 0;
        avg += Kappa.getKappaArrayScore(this.ColorKappaMetrix);
        avg += Kappa.getKappaArrayScore(this.subClassKappaMetrix);
        this.aggregatedFeatureArr.forEach((feature) => {
            avg += Kappa.calculateKappa(feature.kappa);
        });
        return avg / (this.aggregatedFeatureArr.length + 2);

    }


};
    