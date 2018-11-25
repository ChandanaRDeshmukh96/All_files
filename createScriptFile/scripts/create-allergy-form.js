const csvFilePath = '../CSV/allergy-form.csv';
const csv = require('csvtojson');
const fs = require('fs');
let patient = require('../../src/ehr/asset/data/en-us/PMEHR/feature/patient-info.json').data;

function findChartNo(firstName, lastName) {
    var chartNumber;
    // console.log("firstname, lastname", firstName, lastName)
    patient.forEach((item) => {
        if (firstName == item.firstName && lastName == item.lastName) {
            chartNumber = item.chartNumber;
        }
    });
    return chartNumber;
}
function createPatientData(element, i) {

    var dataObj = {};
    dataObj.id = i;
    dataObj.allergyType=element.allergyType;
    // console.log(element.allergyType);
    dataObj.allergyDetail=element.allergyDetail;
    dataObj.onSet=element.onSet;
    if(element.dateAndTime==""){
        dataObj.dateAndTime="";
    }
    else{
        var date= new Date(element.dateAndTime);
    dataObj.dateAndTime=date.toLocaleDateString("en-US") + " 12:00 am"
    }
    
    dataObj.severity=element.severity;
    dataObj.status=element.status;
    dataObj.adverseReaction=element.adverseReaction;
    dataObj.otherSensitivities=element.otherSensitivities;
    
    return dataObj;
}

function createAlleryData(data) {
    var patientSurgicalHistoryData = {
        "info": {
            "status": "200",
            "message": "OK"
        },
        "data": {}
    };

    var chartNo = "";
    var i = 1;
    var patientsData = {};
 
    data.forEach(element => {
        var flag = 0;
        var props=Object.keys(element);
        for(var j=0; j<props.length; j++){
            if(element[props[j]]!=""){
                flag=1;
                break;
            }
        }
        if(flag == 1){
            if (element.patientName != "") {
                i = 1;
                var name = element.patientName.split(" ");
                chartNo = findChartNo(name[0], name[1]);
                if (chartNo) {
                    patientsData[chartNo] = [];
                    var patientData = createPatientData(element, i);
                    // continue;
                }
                else {
                    console.log(element);
                }
            }
            else {
                var patientData = createPatientData(element, i);
    
            }
            i += 1;
            if (chartNo != undefined)
                patientsData[chartNo].push(patientData)
    
        }
        patientSurgicalHistoryData['data'] = patientsData;    

        });
        
    return patientSurgicalHistoryData;
}

csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
        var formattedData = createAlleryData(jsonObj);
        fs.writeFile('../JSON/allergy-form.json', JSON.stringify(formattedData), 'utf8', function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    });