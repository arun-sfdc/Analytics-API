    
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
                }).bindPopup(e[3]).addTo(map);
            }, (i+1)*100);
        });
    };
    
    // simple util method to geocode results
    // input is array for rows, the first cell of each row is the location to be geocoded
    // uses the free Google Geocode API, hence the a bit slow
    // cached using localstorage for faster subsequent access
    var asyncGeoCode = function(input, output) {
            var getGeoCode = function(e, resp) {
                var loc = resp.results[0].geometry.location;
                output.push([loc.lat, loc.lng, e[1], e[0]]);
            };
            input.forEach(function(e, i, arr) {
                if(localStorage.getItem(e[0])) {
                    getGeoCode(e, JSON.parse(localStorage.getItem(e[0])));
                } else {
                    var d = new Date().getTime();
                    while(new Date().getTime() - d <= 100) {}
                    $.ajax('https://maps.googleapis.com/maps/api/geocode/json?address='+e[0], {
                        success: function(resp) {
                            if(resp.status == "OK") {
                                localStorage.setItem(e[0], JSON.stringify(resp));
                                getGeoCode(e, resp);
                            }
                        }
                    });
                }
            });
        };
