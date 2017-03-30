/**
 * Created by kuoa on 1/30/17.
 */

/*milli seconds*/
const fadeValue = 600;

/* minutes */
const updateInterval = 1;

const sl_transport = 'http://api.sl.se/api2/realtimedeparturesV4.json?key=&siteid=9162&timewindow=30';

const transport = [
    'http://www.ratp.fr/horaires/fr/ratp/metro/prochains_passages/PP/glaciere/6/A',
    'http://www.ratp.fr/horaires/fr/ratp/metro/prochains_passages/PP/glaciere/6/R',
    'http://www.ratp.fr/horaires/fr/ratp/bus/prochains_passages/PP/B62/62_1295_1384/A',
    'http://www.ratp.fr/horaires/fr/ratp/bus/prochains_passages/PP/B62/62_1295_1384/R'
]

function getTransportStatus(url, index, successHandler, errorHandler) {

    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
          successHandler(data.ResponseData);
            /* remove images to avoid net::ERR_FILE_NOT_FOUND */
            // html = html.replace(/<img/ig, '<ig');
            // successHandler(html, index);            
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

function parseTransport(html) {
    var jHtml = $.parseHTML(html),
        lineDetails = $(jHtml).find('.line_details').children(),
        type = $(lineDetails[0]).attr('alt'),
        number = $(lineDetails[1]).attr('alt').split(' ')[1],
        name = $(lineDetails[2]).text(),
        direction = $(jHtml).find('.direction').text().split(':')[1],
        timeTable = $($(jHtml).find('tbody')[1]).children();


    var time = [];

    for (var i = 0; i < timeTable.length; i++) {
        var line = $(timeTable[i]).children()[1];
        time[i] = ($(line).text());
    }

    rezult = {
        type: type,
        number: number,
        name: name,
        direction: direction,
        time: time
    };

    return rezult;
}

function displayTransport(data) {
  // data.Metros;
  // data.Trains;
  let idx = 0;

  const groupByDir = _.groupBy(data.Metros, m => m.JourneyDirection);
  _.each(groupByDir, (m, i) => {
    let timeLine = '';
    let destination;
    let lineNumber;

    m.forEach((t) => {
      timeLine += 
      '<span><i class="fa fa-clock-o time-icon" aria-hidden="true"></i>' +
      '<span class="transport-time"> ' + t.DisplayTime + ' </span></span>';
    });
    destination = m[0].Destination;
    lineNumber = m[0].LineNumber;

    let icon = 'fa-subway';
    let html = '<i class="fa ' + icon + '" aria-hidbden="true"></i>' +
        '<span class="sub-title"> ' + lineNumber + ' ' + destination + '</span>' +
        '<div class="transport-timetable">' +
        timeLine +
        '<div>'
    const metroPanel = $('#transport' + idx).html(html);
    idx++;
  });

  const filtered = _.filter(data.Buses, b => b.Destination === 'Farsta centrum' || b.Destination === 'Älvsjö station');
  const groupByBusDir = _.groupBy(filtered, b => b.Destination);
  
  _.each(groupByBusDir, (b) => {
    // console.log(b);
    let timeLine = '';
    let destination;
    let lineNumber;

    b.forEach((t) => {
      timeLine += 
      '<span><i class="fa fa-clock-o time-icon" aria-hidden="true"></i>' +
      '<span class="transport-time"> ' + t.DisplayTime + ' </span></span>';
    });
    destination = b[0].Destination;
    lineNumber = b[0].LineNumber;

    let icon = 'fa-bus';
    let html = '<i class="fa ' + icon + '" aria-hidbden="true"></i>' +
        '<span class="sub-title"> ' + lineNumber + ' ' + destination + '</span>' +
        '<div class="transport-timetable">' +
        timeLine +
        '<div>'
    const metroPanel = $('#transport' + idx).html(html);
    idx++;
  });

  return;
 
    /*var data = parseTransport(html),
        time = data.time,
        timeLine = '';*/
    
    /*for(var i = 0; i < time.length; i++){
        timeLine += 
         '<span><i class="fa fa-clock-o time-icon" aria-hidden="true"></i>' +
         '<span class="transport-time"> ' + time[i] + ' </span></span>';
    }*/
    
    // var icon = (data.type === 'Métro') ? 'fa-subway' : 'fa-bus';

    /*var html = '<i class="fa ' + icon + '" aria-hidbden="true"></i>' +
        '<span class="sub-title"> ' + data.number + ' ' + data.direction + '</span>' +
        '<div class="transport-timetable">' +
        timeLine +
        '<div>'

                            
    var metroPanel = $('#transport' + index).html(html);*/
}

function getAllTransportStatus(){
  getTransportStatus(sl_transport, 0, displayTransport);

  for (var i = 0; i <transport.length; i++){
    // getTransportStatus(transport[i], i, displayTransport);
  }
}

getAllTransportStatus();

/* update */
setInterval(function(){   
   getAllTransportStatus();
   console.log('updated');
}, updateInterval * 60 * 1000) ;
