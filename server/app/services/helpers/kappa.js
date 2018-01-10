    exports.Kappa = class Kappa{


    constructor() {
        this.trueFeature = {
            positive: 0,
            negative: 0
        };
        this.falseFeature = {
            positive: 0,
            negative: 0
        };
    }


    totalTrue() {
        return this.trueFeature.positive + this.falseFeature.negative;
    }

    totalFalse() {
        return this.falseFeature.positive + this.trueFeature.negative;
    }

    totalPositive() {
        return this.trueFeature.positive + this.falseFeature.positive;
    }

    totalNegative() {
        return this.trueFeature.negative + this.falseFeature.negative;
    }

    totalConcordant() {
        return this.trueFeature.positive + this.trueFeature.negative;
    }

    total() {
        return this.totalNegative() + this.totalPositive();
    }

    static createBalanceKappa(kappa) {
        let balanceKappa = new Kappa();
        balanceKappa.trueFeature = {
            positive: kappa.totalTrue() * kappa.totalPositive() / kappa.total(),
            negative: kappa.totalFalse() * kappa.totalNegative() / kappa.total()
        };
        balanceKappa.falseFeature = {
            positive: kappa.totalFalse() * kappa.totalPositive() / kappa.total(),
            negative: kappa.totalTrue() * kappa.totalNegative() / kappa.total()
        };
        return balanceKappa;
    }

    static calculateKappa(kappaTest) {
        const kappaBalance = this.createBalanceKappa(kappaTest);
        const surplusConcordant = kappaTest.totalConcordant() - kappaBalance.totalConcordant();
        const surplusNotConcordant = kappaTest.total() - kappaBalance.totalConcordant();
        const result = surplusConcordant / surplusNotConcordant;
        return isNaN(result)? 0 : result
    }


    static creatKappaObjFromArray(categotyArray) {
        let kapaObj ={
            matretion: {}
        };
        categotyArray = categotyArray.map(feat=>{return feat.toLowerCase()});

        categotyArray.forEach(colFeature => {
            kapaObj.matretion[colFeature] = {};
            categotyArray.forEach(rowFeature => {
                kapaObj.matretion[colFeature][rowFeature] = 0;
            });
        });
        kapaObj.trueResultTotal = [];
        kapaObj.testResultTotal = [];
        kapaObj.calcColSum = function () {
            let total =0;
            Object.keys(this.matretion).forEach(col => {
                let colSum = 0;
                let rowSum = 0;
                Object.keys(this.matretion[col]).forEach(row => {
                    colSum += this.matretion[col][row];
                    rowSum += this.matretion[row][col];
                });
                total +=colSum;
                this.trueResultTotal[col] = colSum;
                this.testResultTotal[col] = rowSum;
            });
            this.total = total
        };
        kapaObj.calcSumOfDiagonal = function() {
            let total = 0;
            Object.keys(this.matretion).forEach(col => {
                total+=this.matretion[col][col]
            });
            this.diagonalSum = total;
        };
        return kapaObj
    }

    static createBalanceArrayKappa(kappa){
        let balanceKappa = this.creatKappaObjFromArray(Object.keys(kappa.matretion));
        Object.keys(kappa.matretion).forEach(col => {
            Object.keys(kappa.matretion[col]).forEach(row => {
                balanceKappa.matretion[col][row]=kappa.trueResultTotal[col]*kappa.testResultTotal[row]/kappa.total
            });
        });
        balanceKappa.calcColSum();
        balanceKappa.calcSumOfDiagonal();
        return balanceKappa
    }

    static getKappaArrayScore(kappaArray) {
        kappaArray.calcColSum();
        kappaArray.calcSumOfDiagonal();
        const balanceKappa = this.createBalanceArrayKappa(kappaArray);
        const surplusConcordant = kappaArray.diagonalSum - balanceKappa.diagonalSum;
        const surplusNotConcordant = kappaArray.total - balanceKappa.diagonalSum;
        return surplusConcordant / surplusNotConcordant;
    }


};