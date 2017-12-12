const path = require('path');
const AnswerSheetMethods = require("../dbModule/methods/answerSheet.method").AnswerSheetMethods;
const ImageMethods = require("../dbModule/methods/image").ImageMethods;

module.exports = function (app) {
    //answerSheetMethods.createFirstSheet("true_answer", trueAnswerFilePath);
    //answerSheetMethods.createFirstSheet("test1", testAnswerFilePath);
    const answerSheetMethods = new AnswerSheetMethods();
    const imageMethods = new ImageMethods();

    app.get('/test', (req, res) => {
        res.send("hello")
    });
    app.get('/calculateScore', (req, res) => {
        console.log("calculating score");
        answerSheetMethods.calculateScore(req.query.name).then(score=>{
            res.status(200).send(score)
            console.log("score sent to client")
        }).catch((err)=>{
            res.status(500).send("General error")
        })
    });
    app.post('/updateParticipant', (req, res) => {
        console.log("creating participant");
        answerSheetMethods.createOrUpdateFromClient(req.body).then((answerSheet)=>{
            res.status(200).send(answerSheet);
            console.log("participant sent to client")
        }).catch(err=>{
            console.log(err);
            res.status(500).send("General error")
        })
    });

    app.get('/getPraticipants', (req, res)=>{
        answerSheetMethods.getPraticipants(req.body.query || {}, req.body.select || {}).then(praticipants=>{
            res.status(200).send(praticipants)
        }).catch(err=>{
            console.log(err)
            res.status(500).send("General error")
        })
    });


    app.get('/getImageToInspect', (req, res)=>{
        console.log("inspecting images")
        imageMethods.getImageByExternalId(req.query.imageId, req.query.participantId).then(contestantImage=>{
            imageMethods.getImageByExternalId(req.query.imageId, "5a2e7d8ca693cd2e06b9872f").then(trueImage =>{
                res.status(200).send({contestantImage, trueImage})
                console.log("images sent to user")
            })
        }).catch(err=>{
            console.log(err);
            res.status(500).send("General error")
        })
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../../client/home/index.html'));
    });

}
