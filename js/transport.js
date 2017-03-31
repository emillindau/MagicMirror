/**
 * Created by kuoa on 1/30/17.
 */

/*milli seconds*/
const fadeValue = 600;

/* minutes */
const updateInterval = 1;

const KEY = require('./config.json').SL_API_KEY;
const HOGDALEN = '9162';
const TIMEWINDOW = '30';
const SL_TRANSPORT = `http://api.sl.se/api2/realtimedeparturesV4.json?key=${KEY}&siteid=${HOGDALEN}&timewindow=${TIMEWINDOW}`;
const FARSTA = 'Farsta centrum';
const ALVSJO = 'Älvsjö station';
const METRO = 'Metro';
const BUS = 'Bus';
const STOCKHOLM = 'Stockholm C';

function getTransportStatus(url, successHandler, errorHandler) {
  $.ajax({
    url: url,
    type: 'GET',
    success: function (data) {
      successHandler(data.ResponseData);     
    },
    error: errorHandler
  });
}
/*
{
  "Name": "Högdalen (Stockholm)",
  "SiteId": "9162",
  "Type": "Station",
  "X": "18041171",
  "Y": "59263121"
},
{
  "Name": "Stockholms C (Stockholm)",
  "SiteId": "9000",
  "Type": "Station",
  "X": "18057657",
  "Y": "59331134"
},
*/ 

function populateHtmlFromData(data, type, index) {
  _.each(data, (m) => {
    let timeLine = '';
    let destination;
    let lineNumber;

    m.forEach((t) => {
      timeLine += 
      '<span><i class="fa fa-clock-o time-icon" aria-hidden="true"></i>' +
      '<span class="transport-time"> ' + t.DisplayTime + ' </span></span>';
    });
    destination = m[0].Destination;

    if(type === METRO && m[0].JourneyDirection === 1) {
      destination = STOCKHOLM;
    }

    lineNumber = m[0].LineNumber;

    let icon = (type === METRO) ? 'fa-subway' : 'fa-bus';
    let html = '<i class="fa ' + icon + '" aria-hidbden="true"></i>' +
        '<span class="sub-title"> ' + lineNumber + ' ' + destination + '</span>' +
        '<div class="transport-timetable">' +
        timeLine +
        '<div>'
    const metroPanel = $('#transport' + index).html(html);
    index++;
  });
  return index;
}


function displayTransport(data) {
  let idx = 0;
  const groupByDir = _.groupBy(data.Metros, m => m.JourneyDirection);
  idx = populateHtmlFromData(groupByDir, METRO, idx);

  const filtered = _.filter(data.Buses, b => b.Destination === FARSTA || b.Destination === ALVSJO);
  const groupByBusDir = _.groupBy(filtered, b => b.Destination);
  idx = populateHtmlFromData(groupByBusDir, BUS, idx);
  
  return;
}

function getAllTransportStatus(){
  getTransportStatus(SL_TRANSPORT, displayTransport);
}

getAllTransportStatus();

/* update */
setInterval(function(){   
   getAllTransportStatus();
   console.log('updated');
}, updateInterval * 60 * 1000) ;
