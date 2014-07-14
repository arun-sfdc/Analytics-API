    
    // simple util method 
    // arguments - Leaflet map object, zoom, lat-long for center, array of points[lat, long, radium(0-100)] 
    function drawLeafletMap(map, zoom, base, points) {
        var baseRadius = 6000;
        var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
        var osm = new L.TileLayer(osmUrl, {minZoom: zoom, maxZoom: zoom, attribution: osmAttrib});
        var baseLayer = L.tileLayer(osmUrl, {
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            maxZoom: zoom
        }).addTo(map);
        map.setView(new L.LatLng(base[0], base[1]), zoom);
        map.addLayer(osm);
        points.forEach(function(e, i, arr) {
            setTimeout(function() {
                var circle = L.circle([e[0], e[1]], e[2]*baseRadius, {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                }).addTo(map);
            }, (i+1)*100);
        });
    };
