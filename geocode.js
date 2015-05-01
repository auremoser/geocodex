
var csv = require('csv-streamify'),
    request = require('request'),
    writeStream = require('csv-write-stream'),
    fs = require('fs');

/////////////
var INPUT_FILE = './data/geocodes_nokia.csv';
var OUTPUT_FILE = './data/results.csv';
var ERROR_FILE = './data/errors.csv';


var headers = ['cartodb_id','orig_geocode_string',
    'orig_lon','orig_lat','mapzen_lon','mapzen_lat',
    'mapquest_lon','mapquest_lat'
    ];

var URL_MAPZEN = 'http://pelias.mapzen.com/search?input=';
var URL_MAPQUEST = 'http://open.mapquestapi.com/nominatim/v1/search.php?format=json&q=';

//////////////

var writer = writeStream({
    separator:'|'
});
writer.pipe(fs.createWriteStream(OUTPUT_FILE));

var errors = writeStream({
    separator:'|'
});
errors.pipe(fs.createWriteStream(ERROR_FILE));

var options= {
    delimiter: ',', // pipes!
    newline: '\n', // newline character
    quote: '"', // what's considered a quote
    // if true, emit arrays instead of stringified arrays or buffers
    objectMode: true,
    // if set to true, uses first row as keys -> [ { column1: value1, column2: value2 }, ...]
    columns: true
};

var fstream = fs.createReadStream(INPUT_FILE),
    parser = csv(options);

var TOTAL = 0;

// emits each line as a buffer or as a string representing an array of fields
parser.on('readable', function () {

    var line = parser.read();
    var url_mapzen = getUrl(URL_MAPZEN, line.geocode_string);
    var url_mapquest = getUrl(URL_MAPQUEST, line.geocode_string);

    var index = parser.lineNo;
    var out = {
        cartodb_id: line.cartodb_id,
        orig_geocode_string: line.geocode_string,
        orig_lat: line.lat,
        orig_lon: line.lon
    };

    request({
        method: 'GET',
        uri: url_mapzen
    }, function(err, res, body1){
        request({
            method: 'GET',
            uri: url_mapquest
        }, function(err, res, body2){

            var parseErrors = [];

            try {
                var mapzen = JSON.parse(body1);
                out.mapzen_lat = mapzen.features[0].geometry.coordinates[1];
                out.mapzen_lon = mapzen.features[0].geometry.coordinates[0];
            } catch(e){
                parseErrors.push('mapzen');
            }

            try {
                var mapquest = JSON.parse(body2);
                out.mapquest_lat = mapquest[0].lat;
                out.mapquest_lon = mapquest[0].lon;
            } catch(e){
                parseErrors.push('mapquest');
            }

            if(parseErrors.length){
                out.errors = parseErrors;
                errors.write(out);
                console.log('ERROR :(');
                return
            }

            writer.write(out);
            console.log('WRITE LINE', index);

            if(index === TOTAL){
                writer.end();
                errors.end();
                process.exit(0);
            }
        });
    });

}).on('end', function(){
    console.log('END', parser.lineNo);
    TOTAL = parser.lineNo;
});

// fstream.pipe(parser).pipe(writer);
fstream.pipe(parser);


function getUrl(url, code){
    return url + encodeURIComponent(code);
}