<?php




$file = fopen("geocodes_nokia.csv","r");

$outfile = fopen("geocodes_testing.csv","w");

$res = array("cartodb_id","orig_geocode_string",
    "orig_lon","orig_lat","mapzen_lon","mapzen_lat",
    "mapquest_lon","mapquest_lat");
fputcsv($outfile,$res);

$flag = true;

while(! feof($file))
  {
  	$row = fgetcsv($file);
  	if($flag) { $flag = false; continue; }

  	print $row[1]."\n";


  	//Mapzen
  	$json = file_get_contents('http://pelias.mapzen.com/search?input='.urlencode($row[1]));
	$obj = json_decode($json);
	$mapzenlon = $obj->features[0]->geometry->coordinates[0];
	$mapzenlat = $obj->features[0]->geometry->coordinates[1];

	//Nominatum
  	$json = file_get_contents('http://open.mapquestapi.com/nominatim/v1/search.php?format=json&q='.urlencode($row[1]));
	$obj = json_decode($json);
	$mapquestlon = $obj[0]->lon;
	$mapqueslat = $obj[0]->lat;

	$res = array($row[0],$row[1],$row[2],$row[3],
        $mapzenlon,$mapzenlat, $mapquestlon,$mapqueslat);
	fputcsv($outfile, $res);


  }

fclose($file);
fclose($outfile);

?>