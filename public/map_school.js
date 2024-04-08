mapboxgl.accessToken = mapbox_token; 
console.log(mapboxgl);
geojson = CA_all_schools;

var filteredData = {};
if (year_str == 'aero') {
    schoolResults.forEach((entry) => {
        if (entry.Line_Text == 'Aerobic Capacity'){
            const cdscode = entry.cdscode;
            const newEntry = {...entry};
            delete newEntry.cdscode;
            filteredData[cdscode] = newEntry;
        }
    });
}
else if (year_str == 'body') {
    schoolResults.forEach((entry) => {
        if (entry.Line_Text == 'Body Composition'){
            const cdscode = entry.cdscode;
            const newEntry = {...entry};
            delete newEntry.cdscode;
            filteredData[cdscode] = newEntry;
        }
    });
}
else if (year_str == 'abd') {
    schoolResults.forEach((entry) => {
        if (entry.Line_Text == 'Abdominal Strength'){
            const cdscode = entry.cdscode;
            const newEntry = {...entry};
            delete newEntry.cdscode;
            filteredData[cdscode] = newEntry;
        }
    });
}
else if (year_str == 'trunk') {
    schoolResults.forEach((entry) => {
        if (entry.Line_Text == 'Trunk Extension Strength'){
            const cdscode = entry.cdscode;
            const newEntry = {...entry};
            delete newEntry.cdscode;
            filteredData[cdscode] = newEntry;
        }
    });
}
else if (year_str == 'ub') {
    schoolResults.forEach((entry) => {
        if (entry.Line_Text == 'Upper Body Stregth'){
            const cdscode = entry.cdscode;
            const newEntry = {...entry};
            delete newEntry.cdscode;
            filteredData[cdscode] = newEntry;
        }
    });
}
else if (year_str == 'flex') {
    schoolResults.forEach((entry) => {
        if (entry.Line_Text == 'Flexibility'){
            const cdscode = entry.cdscode;
            const newEntry = {...entry};
            delete newEntry.cdscode;
            filteredData[cdscode] = newEntry;
        }
    });
}
else {
    schoolResults.forEach((entry) => {
        if (entry.Line_Text == 'Aerobic Capacity'){
            const cdscode = entry.cdscode;
            const newEntry = {...entry};
            delete newEntry.cdscode;
            filteredData[cdscode] = newEntry;
        }
    });
}


// console.log(filteredData);
// console.log(geojson.features);

const mergedFeatures = geojson.features.map((feature) => {
    const cdscode = feature.properties.cdscode;
    // console.log(cdscode);
    const result = filteredData[cdscode];
    // console.log(result);
    if (result){
        return {
            ...feature,
            properties: {
                ...feature.properties,
                ...result
            }
        }
    }
    else {
        // console.log("null");
        return null;
    }
}).filter(Boolean);

const mergedGeojson = {
    type: 'FeatureCollection',
    features: mergedFeatures
}

const year_to_display = 'Perc' + grade_str + 'a_' + year_str.slice(2);

const group_unknown = ['<', ['get', year_to_display], 0];
const group1 = ['all', ['>=', ['get', year_to_display], 0], ['<', ['get', year_to_display], 10]];
const group2 = ['all', ['>=', ['get', year_to_display], 10], ['<', ['get', year_to_display], 20]];
const group3 = ['all', ['>=', ['get', year_to_display], 20], ['<', ['get', year_to_display], 30]];
const group4 = ['all', ['>=', ['get', year_to_display], 30], ['<', ['get', year_to_display], 40]];
const group5 = ['all', ['>=', ['get', year_to_display], 40], ['<', ['get', year_to_display], 50]];
const group6 = ['all', ['>=', ['get', year_to_display], 50], ['<', ['get', year_to_display], 60]];
const group7 = ['all', ['>=', ['get', year_to_display], 60], ['<', ['get', year_to_display], 70]];
const group8 = ['all', ['>=', ['get', year_to_display], 70], ['<', ['get', year_to_display], 80]];
const group9 = ['all', ['>=', ['get', year_to_display], 80], ['<', ['get', year_to_display], 90]];
const group10 = ['all', ['>=', ['get', year_to_display], 90], ['<', ['get', year_to_display], 100]];
const group11 = ['>=', ['get', year_to_display], 100];

const colors = ['#808080', '#92432a', '#a75935', '#bb7042', '#ce884f', '#e1a05d', '#f3b96d', '#ced3cd', '#9ec0dc', '#86abcc', '#6f96bb', '#5981ab'];

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style
    center: [-119.44944, 37.16611], // starting position [lng, lat]
    zoom: 5.3 // starting zoom
});

var navigation = new mapboxgl.NavigationControl();
map.addControl(navigation, 'top-left');

map.on('load', () => {
    console.log("start");
    map.addSource('schools', {
        type: 'geojson',
        data: mergedGeojson,
        cluster: true,
        clusterMaxZoom: 11, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        // filter: ['==', ['get', 'Line_Text'], 'Aerobic Capacity']
    });

    console.log("load finished");
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'schools',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#79d651',
                50,
                '#51bbd6',
                200,
                '#f1f075',
                500,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                25,
                50,
                35,
                200,
                40,
                500,
                45
            ],
            'circle-opacity': 0.9
        }
    });
    console.log("add layer");

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'schools',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    // map.setFilter('cluster-count', ['==', ['get', 'Line_Text'], 'Aerobic Capacity']);

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'schools',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color':
            ['case',
            group1,
            colors[1],
            group2,
            colors[2],
            group3,
            colors[3],
            group4,
            colors[4],
            group5,
            colors[5],
            group6,
            colors[6],
            group7,
            colors[7],
            group8,
            colors[8],
            group9,
            colors[9],
            group10,
            colors[10],
            group11,
            colors[11],
            colors[0]],
            'circle-radius': 13,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.8
        }
    });

    // map.setFilter('unclustered-point', ['==', ['get', 'Line_Text'], 'Aerobic Capacity']);

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('schools').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    
    map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const cdscode = e.features[0].properties.cdscode;
        const county = e.features[0].properties.county;
        const district = e.features[0].properties.district;
        const name = e.features[0].properties.school;
        const address = e.features[0].properties.address;
        const subject = e.features[0].properties.Line_Text;
        const result = e.features[0].properties[year_to_display];

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `<h5>School Name: ${name}</h5><br>CDS Code: ${cdscode}<br>County: ${county}<br>District: ${district}<br>Address: ${address}<br><br><h6>Subject: ${subject}<br>Percentage in HFZ: ${result >= 0 ? result : 'No data available'}</h6>`
            )
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});

var MyControl = L.Control.extend({
    options: {
      position: 'topright'
    },

    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'mapbox-legend');
      return container;
    }
});

map.addControl(new MyControl());