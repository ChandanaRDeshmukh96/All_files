const csvFilePath='../CSV/SOAP-notes-booth.csv';
const csv = require('csvtojson');
const fs = require('fs');
let diagnosis = require('../../src/ehr/asset/data/en-us/booth/feature/ICD-code.json');
let procedure = require('../../src/ehr/asset/data/en-us/booth/feature/cpt-codes.json');
console.log(diagnosis);
/* diagnosis = readJsonFile('../data/json/ICD-code.json');
procedure = readJsonFile('../data/json/cpt-codes.json'); */
var soapnotesData = {};
function readJsonFile(url){
    fs.readFile(url, (err, data) => {  
        if (err) throw err;
        return JSON.parse(data);
    });
}
function createDataArray(dataString, codeArray, key, type, additionalField){
    console.log("codeArray");
    console.log(codeArray);
    // console.log("dataString");
    // console.log(dataString);
    // console.log("key");
    // console.log(key);
// console.log("type=",type);
    var dataArray = [], resultArray = [];
    if (dataString.indexOf(',') !== -1) {
    // console.log("inside if");

        dataArray =  dataString.trim().split(',');
    }
    // console.log("dataArray");
    // console.log(dataArray);
    dataArray.forEach((item) => {
    // console.log("inside forEach");

        var dataObj = {};
        dataObj.id = item.trim();
        debugger;
        console.log("data "+dataObj.id);
        console.log("hjbjbh "+codeArray[dataObj.id]);
        dataObj.value = codeArray[dataObj.id] ? codeArray[dataObj.id][key] : '';
        if(type && type==='procedure'||type==='immunization'){
            // dataObj.additionalField=codeArray[dataObj.id] ? codeArray[dataObj.id][additionalField] : '';
            dataObj.additionalField=additionalField?additionalField : '';
        }
        // console.log(codeArray[dataObj.id]);
        // console.log(dataObj.value);
        resultArray.push(dataObj);
        debugger;
    });
    return resultArray;
}
function createSoapNoteObject(data){
    var dataObj = {};
    dataObj.apptId = data.apptId ? data.apptId : '';
    dataObj.chiefComplaint = data.chiefComplaint ? data.chiefComplaint  : '';
    dataObj.presentIllness = data.presentIllness ? data.presentIllness  : '';
    dataObj.reviewOfSystem = data.reviewOfSystem ? data.reviewOfSystem  : '';
    dataObj.examination = data.examination ? data.examination  : '';
    dataObj.diagnosis = data.diagnosis ? createDataArray(data.diagnosis, diagnosis, 'description')  : [];
    dataObj.prescription = data.prescription ? createDataArray(data.prescription)  : [];
    dataObj.labs = data.labs ? createDataArray(data.labs, procedure, 'description')  : [];
    dataObj.imaging = data.imaging ? createDataArray(data.imaging)  : [];
    dataObj.immunization = data.immunization ? createDataArray(data.immunization, procedure, 'description', 'immunization', data.additionalFieldForImmunization)  : [];
    dataObj.injection = data.imaging ? createDataArray(data.injection)  : [];
    dataObj.procedure = data.procedure ? createDataArray(data.procedure, procedure, 'description', 'procedure', data.additionalFieldForProcedure)  : [];
    dataObj.attachments = data.attachments ? createDataArray(data.attachments)  : [];
    dataObj.followUpRequired = data.followUpRequired ? data.followUpRequired : 'No';
    dataObj.followUpTimeline = data.followUpTimeline ? data.followUpTimeline : 'No';
    dataObj.patientEducation = data.patientEducation ? data.patientEducation  : '';
    dataObj.addendum = data.addendum ? createDataArray(data.addendum)  : [];
    dataObj.referringProvider = data.referringProvider ? createDataArray(data.referringProvider)  : [];
    dataObj.referringLabs = data.referringLabs ? createDataArray(data.referringLabs)  : [];
    dataObj.referringPractice = data.referringPractice ? createDataArray(data.referringPractice)  : [];
    dataObj.SOAPNoteRecordedDate = data.SOAPNoteRecordedDate ? data.SOAPNoteRecordedDate  : '';
    return dataObj;

}
function createSoapNotesData(data){
    data.forEach(element => {
        if(!soapnotesData[element.chartNo]){
            soapnotesData[element.chartNo] = [];
        }
        var props=Object.keys(element);
        for(var j=0; j<props.length; j++){
            if(element[props[j]]!=""){
                flag=1;
                break;
            }
        }
        if(flag == 1){
        var soapNotesData = createSoapNoteObject(element);
        soapnotesData[element.chartNo].push(soapNotesData);
        }
    });
    return soapnotesData;
}


    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        //console.log(jsonObj);
        var formattedData = createSoapNotesData(jsonObj);
        fs.writeFile('../JSON/soap-notes-booth.json', JSON.stringify(formattedData), 'utf8', function (err) {
            if (err) throw err;
            console.log('Saved!');
          });
    });
