import {DrawPolygons} from "../services/drawPolygonsService";

const $ = require('jquery');
import {FileService} from '../services/fileService'
import {DataService} from "../services/dataService";


class App {
    constructor() {
        this.dataService = new DataService();
        this.fileService = new FileService();
        this.participants = [];
        this.name = "no105";
        this.imageId = 100007;
        this.participantId = "5a2e3748a693cd2e06b97185";
        this.answerSheet = null;
        this.onInit()

    }

    onInit() {
        this.nameWarning = $("#participantNameWarning");
        this.uploadFileWarning = $("#uploadFileWarning");
        this.submitError = $("#submitError");
        this.getScoreError = $("#getScoreError");
        this.getScoreSendToServer = $("#getScoreSendToServer");
        this.getScoreSendToServer.hide();
        this.nameWarning.hide();
        this.getScoreError.hide();
        this.uploadFileWarning.hide();
        this.submitError.hide();

        this.submitSuccess = $("#submitSuccess");
        this.allParticipantList = $("#allParticipantList");
        this.fileResult = $("#fileResult");


    }

    getName(e) {
        this.name = e.target.value;
        this.nameWarning.hide()
        this.getScoreError.hide()

    }

    setParticipantId(e) {
        this.participantId = e.target.value;


    }

    setImageId(e) {
        this.imageId = e.target.value;
    }

    parseFile(e) {
        if (!e || !e.target || !e.target.files[0]) {
            return
        }

        this.fileService.createAnswerSheet(e.target.files[0])
            .then((answerSheet => {
                this.answerSheet = answerSheet;
                this.uploadFileWarning.hide()
            }))
            .catch(err => {
                console.log("parse failed" + err)
            })

    }

    submit() {
        if (!this.name) {
            this.nameWarning.show();
            return
        }
        if (!this.answerSheet) {
            this.uploadFileWarning.show();
            return
        }
        const participant = {
            contestantDetails: {
                name: this.name
            },
            sheet: this.answerSheet
        };
        this.submitSuccess.text("file sent to server...");
        this.dataService.updatePraticipant(participant)
            .then((updatedFile => {
                console.log("update success");
                this.submitSuccess.text(`submit success - id:  ${updatedFile._id}`)
                this.submitError.hide()
            }))
            .catch(err => {
                console.log("update failed" + err);
                this.submitError.show()
            })
    }

    calculateScore() {
        if (!this.name) {
            this.getScoreError.show();
            return
        }
        this.getScoreSendToServer.text('Waiting for server').show()
        this.dataService.calculateScore(this.name).then(score => {
            this.getScoreSendToServer.hide()
            this.fileResult.text(JSON.stringify(score))
        }).catch(err => {
            console.log(err)
            this.getScoreSendToServer.text('error in server')
        })
    }
    getAllPartcipants() {
        this.dataService.getAllNames().then(names=>{
          this.allParticipantList.text(JSON.stringify(names))
        }).catch(err=>{console.log(err)})
    }

    inspectImage() {
        console.log("inspecting images")
        this.dataService.getImagesToInspect(this.imageId, this.participantId).then(images => {
            if (images) {
                const container = document.querySelector('svg.base');
                let color = "rgba(0,0,255,0.5)";
                images.trueImage.detections.forEach(detection => {
                    color = "rgba(0,0,255,0.5)";
                    DrawPolygons.drawPolygon(detection.position, container, color, "trueImage", true);
                });
                images.contestantImage.detections.forEach(detection => {
                    color = "rgba(0,255,0,0.5)";
                    DrawPolygons.drawPolygon(detection.position, container, color, "contest", false);
                    if (detection.hit.isHitTarget && detection.hit.interactionPolygon && detection.hit.interactionPolygon.length) {
                        detection.hit.interactionPolygon.forEach(intersection => {
                            color = "rgba(255,0,0,0.3)";
                            DrawPolygons.drawPolygon(intersection, container, color, "intersection");
                        })
                    }
                })
            }
        })
    }
}


let app = new App();
$("#fileInput1").change(app.parseFile.bind(app));
$("#participantName").change(app.getName.bind(app));
$("#submitButton").click(app.submit.bind(app));
$("#calculateScore").click(app.calculateScore.bind(app));
$("#inspectImage").click(app.inspectImage.bind(app));
$("#getAllPartcipants").click(app.getAllPartcipants.bind(app));
$("#participantId").change(app.setParticipantId.bind(app));
$("#imageId").change(app.setImageId.bind(app));



// $("#drawIntersection").click(app.drawIntersection.bind(app));
// $("#getParticipants").click(app.getAllPraticipantsNames.bind(app));
// $("#draw1").click(app.drawPolygon.bind(app));
// $("#draw2").click(app.drawPolygon.bind(app));
// drawPolygon(e) {
//     const color = e.target.id === "draw1" ? "rgba(0,0,255,0.5)" : "rgba(0,255,0,0.5)";
//     const index = e.target.id === "draw1" ? 0 : 1;
//     const container = document.querySelector('svg.base');
//     if (!this.participants || !this.participants.length) {
//         this.participants.push(shortList)
//         this.participants.push(shortListObj2)
//     }
//     DrawPolygons.drawPolygon(this.participants[index].sheet[0].detections[0].position, container, color);
//     DrawPolygons.drawPolygon(this.participants[index].sheet[0].detections[1].position, container, color);
//
// }
//
// drawIntersection(e) {
//     const color = "rgba(255,0,0,0.5)";
//     const container = document.querySelector('svg.base');
//     let polygons = [];
//     const a = intersect(this.participants[0].sheet[0].detections[0].position, this.participants[1].sheet[0].detections[0].position);
//     const b = intersect(this.participants[0].sheet[0].detections[1].position, this.participants[1].sheet[0].detections[1].position);
//     const c = intersect(this.participants[0].sheet[0].detections[0].position, this.participants[1].sheet[0].detections[1].position);
//     const d = intersect(this.participants[0].sheet[0].detections[1].position, this.participants[1].sheet[0].detections[0].position);
//     polygons = polygons.concat(a, b, c, d);
//     polygons.forEach(polygon => {
//         if (polygon) {
//             DrawPolygons.drawPolygon(polygon, container, color);
//         }
//     })
// }