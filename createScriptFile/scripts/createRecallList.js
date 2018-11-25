// function formatDate(date) {
//     var monthNames = [
//       "January", "February", "March",
//       "April", "May", "June", "July",
//       "August", "September", "October",
//       "November", "December"
//     ];
  
//     var day = date.getDate();
//     var monthIndex = date.getMonth();
//     var year = date.getFullYear();
  
//     return day + ' ' + monthNames[monthIndex] + ' ' + year;
//   }
//   var date= new Date("1/12/2018")
//   console.log(date)
//   console.log(formatDate(date));
//   var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//   console.log(date.toLocaleDateString("en-US", options));
//   console.log(date)
//*************************************** 

  const csvFilePath = '../CSV/recallListPMEHR.csv';
const csv = require('csvtojson');
const fs = require('fs');
let patient = require('../../src/ehr/asset/data/en-us/PMEHR/feature/patient-info.json').data;
let provider = require('../../src/ehr/asset/data/en-us/PMEHR/feature/provider-info.json').data;

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

function findProviderInfo(lastname){
    var providerInfo;

    provider.forEach((item) => {
        if (item.lastName==lastname){
            providerInfo=item;
        }
    });
    return providerInfo;
}

function createRecallData(element, chartNo, providerInfo) {

    var dataObj = {};
    dataObj.recallId = element.recallId;
    dataObj.patientInfo={};
    dataObj.patientInfo.chartNumber=chartNo;
    dataObj.providerInfo={};
    dataObj.providerInfo.providerUserID=providerInfo.providerUserID;
    dataObj.recallStatus=element.recallStatus;
    dataObj.recallReason=element.recallReason;
    var date= new Date(element.recallWeek);
    dataObj.recallWeek=date.toLocaleDateString("en-US");

    return dataObj;
}

function createRecalList(data) {
    var patientSurgicalHistoryData = {
        "info": {
            "status": "200",
            "message": "OK"
        },
        "data": []
    };

    var chartNo = "";
    var i = 1;
    var patientsData = {};
    data.forEach(element => {
        var providerInfo= findProviderInfo(element.providerName.split("Dr. ")[1]);
        var name = element.patientName.split(" ");
        chartNo = findChartNo(name[0], name[1]);
        patientsData=createRecallData(element,chartNo,providerInfo);
    patientSurgicalHistoryData['data'].push(patientsData);
    });

    return patientSurgicalHistoryData;
}

csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
        var formattedData = createRecalList(jsonObj);
        fs.writeFile('../JSON/recallList.json', JSON.stringify(formattedData), 'utf8', function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    });