(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.NetaFilter = {};

// Create the map
window.NetaFilter.mapView = {
  init: function(map) {
    var self = this;
    self.map = map;

    this.ractive = new Ractive({
      data: {
        selectedConstituency: ''
      },
      oninit: function() {
        self.map.on('style.load', function() {
          // The map tooltip
          var tooltip = new Ractive({
            el: '#map-tooltip',
            template: '#myneta-tooltip',
            data: {},
            setFeatures: function(feature) {
              this.set({
                id: feature.properties['myneta Sno'],
                candidate: feature.properties['myneta Candidate'],
                constituency: feature.properties['PC_NAME2'],
                state: feature.properties['ST_NAME'],
                category: feature.properties['Res'],
                party: feature.properties['myneta Party'].replace(/\(|\)/g, '').replace(/\s+/g, '-').replace(/\./g, ''),
                cases: feature.properties['myneta Criminal Case'],
                qualification: feature.properties['myneta Education'],
                assets: (feature.properties['myneta Total Assets'] / 10000000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' crore',
                liabilities: (feature.properties['myneta Liabilities'] / 10000000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' crore'
              });
            }
          });

          // Create a layer to highlight hovered over features
          var selectedLayer = self.map.addLayer({
            "id": "highlight-feature",
            "type": "fill",
            "source": "mapbox://planemad.6wpgu5qz",
            "source-layer": "myneta-loksabha",
            "filter": [
              "==", "a", "a"
            ],
            "layout": {
              "visibility": "visible"
            },
            "paint": {
              "fill-color": 'black',
              "fill-opacity": 0.5
            }
          }, 'admin-3-4-boundaries-bg');

          var hoverFeature = {};

          var clickedFeature = undefined;
          self.map.on('mousemove', function(e) {

            // Get feature at mouse pointer
            var queryResults = self.map.queryRenderedFeatures(e.point, {layers: ['myneta-loksabha fill']});

            hoverFeature = queryResults[0];

            // Change cursor on interactive objects
            map.getCanvas().style.cursor = (queryResults.length)
              ? 'pointer'
              : '';

            // If nothing has been clicked set the tooltip to hovered elements
            if (typeof clickedFeature == "undefined") {
              // Set tooltip
              if (queryResults.length) {
                tooltip.setFeatures(hoverFeature);
                $('#map-tooltip').css({display: 'block'});
                map.setFilter('highlight-feature', [
                  '==', 'myneta Candidate', hoverFeature.properties['myneta Candidate']
                ]);

              } else {

                $('#map-tooltip').css({display: 'none'});
                map.setFilter('highlight-feature', ['==', 'PC_NAME2', ""]);
              }

            } else {
              tooltip.setFeatures(clickedFeature);
              $('#map-tooltip').css({display: 'block'});
              map.setFilter('highlight-feature', [
                '==', 'myneta Candidate', clickedFeature.properties['myneta Candidate']
              ]);
            }

          });

          //Unstick tooltip if one is already selected
          self.map.on('click', function(e) {
            if (typeof clickedFeature !== "undefined") {
              clickedFeature = undefined;
              console.log(clickedFeature);
            } else {
              clickedFeature = hoverFeature;
            }
          });
        });
      }
    });
  }
};

},{}],2:[function(require,module,exports){
// Configure your Mapbox map project

var project = {
    name: 'Netafilter Parliament Constituency Visualization',
    map: {
      container: 'map',
      style: 'mapbox://styles/planemad/cijswl6y7009rcakwxo2nuu7x',
      zoom: 5.1,
      center: [80.181,27.161],
      maxBounds: [[50.3,5.45], [110,39]]
    },
    accessToken: 'pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ'
}

// Export module
module.exports = project;

},{}],3:[function(require,module,exports){
// Bring in Mapbox GL helper functions
var mapboxglUtils = require('./mapbox-gl-utils');

// Initialize the map
var map = require('./map');

// Run the app
var app = require('./app');

window.NetaFilter.mapView.init(map);

// Map ready
map.on('style.load', function(e) {
  map.addLayer({
    "id": "myneta-loksabha-points education",
    "type": "circle",
    "source": "mapbox://planemad.7hf43eyu",
    "source-layer": "myneta-loksabha-points",
    "filter": [
      "!=", "PC_CODE", -1
    ],
    "paint": {
      "circle-color": 'hsl(116, 85%, 39%)',
      "circle-opacity": 0.6,
      "circle-radius": {
        "property": "myneta E_1",
        "stops": [
          [
            0, 0
          ],
          [
            8, 2
          ],
          [
            18, 4
          ],
          [
            30, 30
          ]
        ]
      }
    }
  }, 'myneta-loksabha selected');

  map.addLayer({
    "id": "myneta-loksabha-points assets",
    "type": "circle",
    "source": "mapbox://planemad.7hf43eyu",
    "source-layer": "myneta-loksabha-points",
    "filter": [
      "!=", "PC_CODE", -1
    ],
    "paint": {
      "circle-color": 'white',
      "circle-opacity": 0.4,
      "circle-radius": {
        "property": "myneta Tot",
        "stops": [
          [
            0, 0
          ],
          [
            1000000, 2
          ],
          [
            100000000, 15
          ],
          [
            1000000000, 25
          ],
          [
            10000000000, 40
          ]
        ]
      }
    }
  }, 'myneta-loksabha selected');

  map.addLayer({
    "id": "myneta-loksabha-points criminal",
    "type": "circle",
    "source": "mapbox://planemad.7hf43eyu",
    "source-layer": "myneta-loksabha-points",
    "filter": [
      "!=", "PC_CODE", -1
    ],
    "paint": {
      "circle-color": '#f37321',
      "circle-opacity": 0.7,
      "circle-radius": {
        "property": "myneta Cri",
        "stops": [
          [
            0, 0
          ],
          [
            1, 2
          ],
          [
            4, 8
          ],
          [
            30, 30
          ]
        ]
      }
    }
  }, 'myneta-loksabha selected');

  map.addLayer({
    "id": "myneta-loksabha fill",
    "type": "fill",
    "source": "mapbox://planemad.6wpgu5qz",
    "source-layer": "myneta-loksabha",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": '#888',
      "fill-opacity": 0.1
    }
  }, 'myneta-loksabha selected');

  // Layer switcher
  $(".selectionGroupButton").each(function() {
    $(this).click(function() {
      $(".selectionGroupButton").removeClass('active');
      $(this).addClass('active');
      mapboxglUtils.mapToggleLayerIdFromGroup(map, $(this).data("layer"), ["myneta-loksabha-points education", "myneta-loksabha-points criminal", "myneta-loksabha-points assets"]);
    })
  })
});

},{"./app":1,"./map":4,"./mapbox-gl-utils":5}],4:[function(require,module,exports){
// Project map configuration
var Config = require('./config');
mapboxgl.accessToken = Config.accessToken;

var Merge = require('merge');

// Extend map creation options
// https://www.mapbox.com/mapbox-gl-js/api/#Map
var mapOptions = Merge({
  hash: true
}, Config.map);

// Inititalize the map
var map = new mapboxgl.Map(mapOptions);

// Add map controls
map.addControl(new MapboxGeocoder({accessToken: mapboxgl.accessToken, country: 'IN'}));

// Add geolocate control to the map.
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}));

// Export module
module.exports = map;

},{"./config":2,"merge":6}],5:[function(require,module,exports){
// Utility functions to work with Mapbox GL JS maps
// Requires mapbox-gl.js and jquery

// Dependencies
// var mapboxLayers = require('./layers').layers;
// var mapboxDataset = require('./dataset');


// Toggle visibility of a layer
function toggle(id) {
    var currentState = map.getLayoutProperty(id, 'visibility');
    var nextState = currentState === 'none' ? 'visible' : 'none';
    map.setLayoutProperty(id, 'visibility', nextState);
}

// Hide all except one layer from a group
function showOnlyLayers(map, showLayerItem, toggleLayers) {
    for (var layerItem in toggleLayers) {
            if (showLayerItem == toggleLayers[layerItem] || showLayerItem == 'all') {
                map.setLayoutProperty(toggleLayers[layerItem], 'visibility', 'visible');
            } else
                map.setLayoutProperty(toggleLayers[layerItem], 'visibility', 'none');
    }
    // Highlight menu items
    $('.toggles a').removeClass('active');
    $('#' + showLayerItem).addClass('active');
}

// Toggle a set of filters for a set of layers
function toggleLayerFilters(layerItems, filterItem) {

    for (var i in layerItems) {
        for (var j in toggleLayers[layerItems[i]].layers) {

            var existingFilter = map.getFilter(toggleLayers[layerItems[i]].layers[j]);

            // Construct and add the filters if none exist for the layers
            if (typeof existingFilter == 'undefined') {
                map.setFilter(toggleLayers[layerItems[i]].layers[j], toggleFilters[filterItem].filter);
            } else {
                // Not implemented
                var newFilter = mergeLayerFilters(existingFilter, toggleFilters[filterItem].filter);
                map.setFilter(toggleLayers[layerItems[i]].layers[j], newFilter);
                // console.log(newFilter);
            }

        }
    }
}

// Parse the toggleFilters to build the compound filter arrays
function parseToggleFilters() {
    for (var filterItem in toggleFilters) {

        var parsedFilter = new Array();
        parsedFilter.push(toggleFilters[filterItem]['filter-mode']);

        for (var value in toggleFilters[filterItem]['filter-values']) {
            var filter = new Array();
            filter.push(toggleFilters[filterItem]['filter-compare'][0], toggleFilters[filterItem]['filter-compare'][1], toggleFilters[filterItem]['filter-values'][value]);
            parsedFilter.push(filter);
        }

        toggleFilters[filterItem]['filter'] = parsedFilter;
    }
}

// Merge two GL layer filters into one
function mergeLayerFilters(existingFilter, mergeFilter) {
    var newFilter = new Array();

    // If the layer has a simple single filter
    if (existingFilter[0] == '==') {
        newFilter.push("all", existingFilter, mergeFilter)
    }

    return newFilter;
}

// Return a square bbox of pixel coordinates from a given x,y point
function pixelPointToSquare(point, width) {
    var pointToSquare = [
        [point.x - width / 2, point.y - width / 2],
        [point.x + width / 2, point.y + width / 2]
    ];
    return pointToSquare;
}


//
// OpenStreetMap Utilities
//

// Return features near a paoint from a set of map layers
function queryLayerFeatures(map, point, opts) {

    var queryResults = map.queryRenderedFeatures(pixelPointToSquare(point, opts.radius), {
        layers: opts.layers
    });

    return queryResults;

}

//Open map location in JOSM
function openInJOSM(map, opts) {
    var bounds = map.getBounds();
    var top = bounds.getNorth();
    var bottom = bounds.getSouth();
    var left = bounds.getWest();
    var right = bounds.getEast();
    // var josmUrl = 'https://127.0.0.1:8112/load_and_zoom?left='+left+'&right='+right+'&top='+top+'&bottom='+bottom;
    var josmUrl = 'http://127.0.0.1:8111/load_and_zoom?left=' + left + '&right=' + right + '&top=' + top + '&bottom=' + bottom;
    $.ajax(josmUrl, function() {});
}


function createHTML(map, type, opts) {
    var HTML, url, obj_type;
    if ('open-obj-in-josm-button') {
        if (opts) {
            node_ids = ',n' + opts.select_node_ids[0] + ',n' + opts.select_node_ids[1];
            url = 'http://127.0.0.1:8111/load_object?new_layer=true&objects=' + opts.obj_type + opts.obj_id + node_ids + '&relation_members=true';
        } else {
            var bounds = map.getBounds();
            var top = bounds.getNorth();
            var bottom = bounds.getSouth();
            var left = bounds.getWest();
            var right = bounds.getEast();
            url = 'http://127.0.0.1:8111/load_and_zoom?left=' + left + '&right=' + right + '&top=' + top + '&bottom=' + bottom;
        }
    }
    HTML = '<a class="button short" target="_blank" href=' + url + '>Open in JOSM</a>';
    return HTML;
}


// Configure layer names for base map for proper layer positioning
var mapboxLayerIDs = {
    "water": "water",
    "label": "poi-scalerank3",
    "roads": "tunnel-street-low"
}


// Add commonly used data layers and styles to a Mapbox map
function addMapboxLayers(map, layers) {

    for (var i in layers) {
        if (layers[i] in mapboxLayers) {

            // Add the defined source and layers for each group
            var groupName = layers[i];

            for (var j in mapboxLayers[layers[i]].groups) {

                // Add the group source
                var sourceName = groupName + ' ' + mapboxLayers[layers[i]].groups[j].name;
                map.addSource(sourceName, mapboxLayers[layers[i]].groups[j].source);

                // Add the group style layers
                for (var k in mapboxLayers[layers[i]].groups[j].layers) {

                    // Generate unique layer ID and source
                    if ("name" in mapboxLayers[layers[i]].groups[j].layers[k]) {
                        mapboxLayers[layers[i]].groups[j].layers[k]["id"] = sourceName + ' ' + mapboxLayers[layers[i]].groups[j].layers[k].name;
                        delete mapboxLayers[layers[i]].groups[j].layers[k]["name"];
                    }
                    mapboxLayers[layers[i]].groups[j].layers[k]["source"] = sourceName;

                    map.addLayer(mapboxLayers[layers[i]].groups[j].layers[k]);

                }
            }
        }
        //Add Mapillary JS viewer on clicking a photograph location
        if (layers[i] == 'mapillary') {

            var mly = new Mapillary.Viewer(
                'mapillary-viewer',
                'MFo5YmpwMmxHMmxJaUt3VW14c0ZCZzoyMTgwOGNmZDljZjBmYjFh'
            );

            map.on('click', function(e) {

                document.getElementById('mapillary-viewer').style.visibility = "visible";

                var clickedFeatures = queryLayerFeatures(map, e.point, {
                    layers: ['mapillary traffic-sign location'],
                    radius: 15
                });


                if (clickedFeatures.length) {
                    console.log(clickedFeatures);

                    var imageKey = clickedFeatures[0].properties.image_key;
                    var imageUrl = 'https://d1cuyjsrcm0gby.cloudfront.net/' + imageKey + '/thumb-2048.jpg';

                    mly.moveToKey(imageKey);

                    //openInJOSM();
                } else {
                    document.getElementById('mapillary-viewer').style.visibility = "none";
                }
            });
        }

    }
}

// API
module.exports.addMapboxLayers = addMapboxLayers;
module.exports.queryLayerFeatures = queryLayerFeatures;
module.exports.createHTML = createHTML;
module.exports.mapToggleLayerId = toggle;
module.exports.mapToggleLayerIdFromGroup = showOnlyLayers;

},{}],6:[function(require,module,exports){
/*!
 * @name JavaScript/NodeJS Merge v1.2.0
 * @author yeikos
 * @repository https://github.com/yeikos/js.merge

 * Copyright 2014 yeikos - MIT license
 * https://raw.github.com/yeikos/js.merge/master/LICENSE
 */

;(function(isNode) {

	/**
	 * Merge one or more objects 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	var Public = function(clone) {

		return merge(clone === true, false, arguments);

	}, publicName = 'merge';

	/**
	 * Merge two or more objects recursively 
	 * @param bool? clone
	 * @param mixed,... arguments
	 * @return object
	 */

	Public.recursive = function(clone) {

		return merge(clone === true, true, arguments);

	};

	/**
	 * Clone the input removing any reference
	 * @param mixed input
	 * @return mixed
	 */

	Public.clone = function(input) {

		var output = input,
			type = typeOf(input),
			index, size;

		if (type === 'array') {

			output = [];
			size = input.length;

			for (index=0;index<size;++index)

				output[index] = Public.clone(input[index]);

		} else if (type === 'object') {

			output = {};

			for (index in input)

				output[index] = Public.clone(input[index]);

		}

		return output;

	};

	/**
	 * Merge two objects recursively
	 * @param mixed input
	 * @param mixed extend
	 * @return mixed
	 */

	function merge_recursive(base, extend) {

		if (typeOf(base) !== 'object')

			return extend;

		for (var key in extend) {

			if (typeOf(base[key]) === 'object' && typeOf(extend[key]) === 'object') {

				base[key] = merge_recursive(base[key], extend[key]);

			} else {

				base[key] = extend[key];

			}

		}

		return base;

	}

	/**
	 * Merge two or more objects
	 * @param bool clone
	 * @param bool recursive
	 * @param array argv
	 * @return object
	 */

	function merge(clone, recursive, argv) {

		var result = argv[0],
			size = argv.length;

		if (clone || typeOf(result) !== 'object')

			result = {};

		for (var index=0;index<size;++index) {

			var item = argv[index],

				type = typeOf(item);

			if (type !== 'object') continue;

			for (var key in item) {

				var sitem = clone ? Public.clone(item[key]) : item[key];

				if (recursive) {

					result[key] = merge_recursive(result[key], sitem);

				} else {

					result[key] = sitem;

				}

			}

		}

		return result;

	}

	/**
	 * Get type of variable
	 * @param mixed input
	 * @return string
	 *
	 * @see http://jsperf.com/typeofvar
	 */

	function typeOf(input) {

		return ({}).toString.call(input).slice(8, -1).toLowerCase();

	}

	if (isNode) {

		module.exports = Public;

	} else {

		window[publicName] = Public;

	}

})(typeof module === 'object' && module && typeof module.exports === 'object' && module.exports);
},{}]},{},[3]);
