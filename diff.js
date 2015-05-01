
var csv = require('csv-streamify'),
    request = require('request'),
    writeStream = require('csv-write-stream'),
    fs = require('fs');

/////////////
var INPUT_FILE = './data/results.csv';
var OUTPUT_FILE = './data/diff.csv';
var ERROR_FILE = './data/errors_diff.csv';


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
    delimiter: '|', // pipes!
    newline: '\n', // newline character
    quote: '"', // what's considered a quote
    // if true, emit arrays instead of stringified arrays or buffers
    objectMode: true,
    // if set to true, uses first row as keys -> [ { column1: value1, column2: value2 }, ...]
    columns: true
};

var fstream = fs.createReadStream(INPUT_FILE),
    parser = csv(options);

// emits each line as a buffer or as a string representing an array of fields
parser.on('readable', function () {

    var line = parser.read();
    console.log('LINE', line);
    var out = {
        cartodb_id: line.cartodb_id,
        orig_geocode_string: line.orig_geocode_string,
        orig_lat: parseFloat(line.orig_lat),
        orig_lon: parseFloat(line.orig_lon)
    };

    out.mapzen_diff_lat = Math.abs(parseFloat(out.orig_lat) - parseFloat(line.mapzen_lat));
    out.mapzen_diff_lon = Math.abs(parseFloat(out.orig_lon) - parseFloat(line.mapzen_lon));

    out.mapquest_diff_lat = Math.abs(parseFloat(out.orig_lat) - parseFloat(line.mapquest_lat));
    out.mapquest_diff_lon = Math.abs(parseFloat(out.orig_lon) - parseFloat(line.mapquest_lon));



    writer.write(out);

}).on('end', function(){
    console.log('END');
});

fstream.pipe(parser).pipe(writer);

