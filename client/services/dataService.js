const serverUrl = "http://localhost:3000";
const $ = require('jquery');

export class DataService {


    updatePraticipant(answerSheet) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                data: JSON.stringify(answerSheet),
                contentType: 'application/json',
                url: serverUrl + "/updateParticipant",
                success: (res) => {
                    return resolve(res)
                },
                error: (err) => {
                    console.log(err)
                    reject (err)
                }
            })
        })
    }
    calculateScore(participantName){
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: serverUrl + "/calculateScore",
                data: {name: participantName},
                success: (res) => {
                    return resolve(res)
                },
                error: (err) => {
                    console.log(err)
                    return reject(err)

                }
            })
        })
    }

    getAllNames() {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: serverUrl + "/getPraticipants",
                success: (res) => {
                    return resolve(res)
                },
                error: (err) => {
                    console.log(err)
                    return reject(err)

                }
            })
        })
    }

    getImagesToInspect(imageId, participantId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: serverUrl + "/getImageToInspect",
                data: {imageId, participantId},
                success: (res) => {
                    return resolve(res)
                },
                error: (err) => {
                    console.log(err);
                    return reject(err)

                }
            })
        })

    }
}