<?php
// Employee Route Map - Single PHP File Project

header('Content-Type: text/html');
$empdata = file_get_contents('empdata.json');
$employees = json_decode($empdata, true)['employees'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Route Map</title>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDzR_iwppyWZuYHsn3usvq1TUkmLfYGm4Y&callback=initMap" async defer></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; text-align: center; }
        #map { height: 80vh; width: 100%; }
        select { margin: 10px; padding: 10px; font-size: 16px; border: 2px solid rgb(105,108,255); border-radius: 5px; }
    </style>
</head>
<body>
    <h2 style="color: rgb(105,108,255);">Employee Route Map</h2>
    <select id="employeeSelect" onchange="loadEmployeeRoute()">
        <option value="">Select Employee</option>
        <?php foreach ($employees as $emp) { ?>
            <option value='<?= json_encode($emp['locations']) ?>'><?= $emp['name'] ?> (<?= $emp['employee_id'] ?>)</option>
        <?php } ?>
    </select>
    <div id="map"></div>
    
    <script>
        let map;
        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: { lat: 40.7128, lng: -74.0060 },
            });
        }
        
        function loadEmployeeRoute() {
            const select = document.getElementById("employeeSelect");
            const locations = JSON.parse(select.value || "[]");
            if (locations.length === 0) return;

            const pathCoordinates = locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }));
            map.setCenter(pathCoordinates[0]);

            new google.maps.Marker({
                position: pathCoordinates[0],
                map,
                label: "S",
                title: "Start Point",
            });
            new google.maps.Marker({
                position: pathCoordinates[pathCoordinates.length - 1],
                map,
                label: "E",
                title: "End Point",
            });
            
            new google.maps.Polyline({
                path: pathCoordinates,
                geodesic: true,
                strokeColor: "rgb(105,108,255)",
                strokeOpacity: 1.0,
                strokeWeight: 4,
                map: map,
            });
        }
    </script>
</body>
</html>
