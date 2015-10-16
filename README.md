## geocodex
[project] test of a few geocoders to see results.

### to run

* cd into directory
* `npm i` // install node packages
* `node geocode.js` // to test nokia geocodes sample against mapzen and mapquest -> generates results.csv and errors.csv
* `node diff.js` // to calc the difference between these geocoded values and help decide which one is better

### what is this?

Script 1 (`geocode.js`) references a csv of string coordinates using mapzen and mapquest's geocoders, and write these to a file (`results.csv`) for comparison with a standard set of geocoded strings. Errors write to `errors.csv` with some notation about the culprit.

Script 2 (`diff.js`) calcs the distance each geocoder references from the standard (control) st, based on the same strings, and generates a `diff.csv` to illustrate.

### thanks!

thanks mapzen and mapquest for the great dev work on your apis

