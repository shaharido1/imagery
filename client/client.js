import {intersect} from "./polygonIntersection";

const $ = require('jquery');
const serverUrl = "http://localhost:3000";
import {ProcessFile} from './processFile'
import {DrawPolygons} from './drawPolygons'
import {shortList} from './shortListObj'
import {shortListObj2} from './shortListObj2'

const papa = require('papaparse')


class App {
    constructor() {
        this.participants = [];
    }

    parseFile(e) {
        if (!e || !e.target || !e.target.files[0]) {
            return
        }
        const that = this;
        papa.parse(e.target.files[0], {
            header: true, complete(results) {
                const answerSheet = {
                    contestantDetails: {
                        name: e.target.name
                    },
                    sheet: ProcessFile.parseData(results.data)
                };
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(answerSheet),
                    contentType: 'application/json',
                    url: serverUrl + "/createParticipant",
                    success: (res) => {
                        that.participants.push(res);
                        $("#" + e.target.name).text("ok");
                        console.log(JSON.stringify(res));
                        console.log(res)
                    },
                    error: (err) => {
                        $("#" + e.target.name).text("err");
                        console.log(err)
                    }
                })
            }, error(err) {
                console.log(err);
                reject(err)
            }
        })
    }

    drawPolygon(e) {
        const color = e.target.id === "draw1" ? "rgba(0,0,255,0.5)" : "rgba(0,255,0,0.5)";
        const index = e.target.id === "draw1" ? 0 : 1;
        const container = document.querySelector('svg.base');
        if (!this.participants || !this.participants.length) {
            this.participants.push(shortList)
            this.participants.push(shortListObj2)
        }
        DrawPolygons.drawPolygon(this.participants[index].sheet[0].detections[0].position, container, color);
        DrawPolygons.drawPolygon(this.participants[index].sheet[0].detections[1].position, container, color);

    }

    drawIntersection(e) {
        const color = "rgba(255,0,0,0.5)";
        const container = document.querySelector('svg.base');
        let polygons = [];
        const a = intersect(this.participants[0].sheet[0].detections[0].position, this.participants[1].sheet[0].detections[0].position);
        const b = intersect(this.participants[0].sheet[0].detections[1].position, this.participants[1].sheet[0].detections[1].position);
        const c = intersect(this.participants[0].sheet[0].detections[0].position, this.participants[1].sheet[0].detections[1].position);
        const d = intersect(this.participants[0].sheet[0].detections[1].position, this.participants[1].sheet[0].detections[0].position);
        polygons = polygons.concat(a,b,c,d);
        polygons.forEach(polygon=> {
            if (polygon) {
                DrawPolygons.drawPolygon(polygon, container, color);
            }
        })
    }


}


let app = new App();

$("#fileInput1").change(app.parseFile.bind(app));
$("#fileInput2").change(app.parseFile.bind(app));
$("#draw1").click(app.drawPolygon.bind(app));
$("#draw2").click(app.drawPolygon.bind(app));
$("#drawIntersection").click(app.drawIntersection.bind(app));

