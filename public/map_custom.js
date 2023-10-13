function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// change here for dev before AWS deployment
const dev = false;

// var map_lat = 37.1661;
// var map_lon = -119.4494;
// var zoom = 7;

var map = L.map('map').setView([map_lat, map_lon], map_zoom)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

if (checkbox.length > 0) {
    var link = '';
    if (dev) {
        link = "http://127.0.0.1:8080/geoserver/";
    }
    else {
        link = "http://ec2-54-176-149-48.us-west-1.compute.amazonaws.com:8080/geoserver/";
    }

    var stylename = 'district:';
    var layer = 'california:' + item_str;

    // for debug uses

    // const debugStr = item_str + grade_str + year_str
    // console.log(debugStr);
    console.log(stylename);

    if (checked_length >= 1125 || checked_length <= 128) {
        stylename += checkbox;
        var wmsLayer = L.Geoserver.wms(link + "wms", {
            layers: layer,
            styles: "california:custom",
            env: stylename
        });
        wmsLayer.addTo(map);
        // console.log(wmsLayer);
    }
    else {
        var checked = [];
        var iter = Math.ceil(checked_length / 128);
        for (var i = 1; i <= iter; i++) {
            if (checked_length > i * 15 * 128) {
                console.log(checkbox.substring((i-1) * 15 * 128, i * 15 * 128 - 1));
                checked.push(L.Geoserver.wms(link + "wms", {
                    layers: layer,
                    styles: "california:custom",
                    env: stylename + checkbox.substring((i-1) * 15 * 128, i * 15 * 128 - 1)
                }));
            }
            else {
                console.log(checkbox.substring((i-1) * 15 * 128));
                checked.push(L.Geoserver.wms(link + "wms", {
                    layers: layer,
                    styles: "california:custom",
                    env: stylename + checkbox.substring((i-1) * 15 * 128)
                }));
            }
            sleep(1000);
        }

        for (var j = 0; checked[j]; j++) {
            checked[j].addTo(map);
        }
    }

    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        div.innerHTML += '<img src="legend_custom.png" alt="legend">';
        return div;
    };
    legend.addTo(map);

    map.on('click', function (e) {
        var popLocation = e.latlng;
        var latlngStr = '(' + e.latlng.lat.toFixed(3) + ', ' + e.latlng.lng.toFixed(3) + ')';
        var BBOX = map.getBounds()._southWest.lng + "," + map.getBounds()._southWest.lat + "," + map.getBounds()._northEast.lng + "," + map.getBounds()._northEast.lat;
        var WIDTH = map.getSize().x;
        var HEIGHT = map.getSize().y;
        var X = Math.floor(map.layerPointToContainerPoint(e.layerPoint).x);
        var Y = Math.floor(map.layerPointToContainerPoint(e.layerPoint).y);
        var URL = link + 'california/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=' + layer + '&QUERY_LAYERS=' + layer.substring(11) + '&propertyName=CountyName,DistrictNa,data' + '&STYLES=&BBOX=' + BBOX + '&FEATURE_COUNT=5&HEIGHT=' + HEIGHT + '&WIDTH=' + WIDTH + '&FORMAT=image%2Fpng&INFO_FORMAT=text%2fhtml&SRS=EPSG%3A4326&X=' + X + '&Y=' + Y;
        var popup = L.popup()
            .setLatLng(popLocation)
            .setContent("<iframe src='" + URL + "' frameborder='0'></iframe>")
            .openOn(map);
    });
}

