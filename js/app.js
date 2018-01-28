window.NetaFilter = {};

var electoralLevelDict = {
  "mp": {
    "label": "Parliamentary Constituencies",
    "layers": {
      "labels": [],
      "points": ["myneta-loksabha-points education", "myneta-loksabha-points criminal", "myneta-loksabha-points assets"],
      "border": ["myneta-loksabha line"],
      "base": ["myneta-baselayer"]
    },
    "source": "mapbox://planemad.6wpgu5qz",
    "source-layer": "myneta-loksabha",
    "fieldDict": {
      "id": "PC_CODE",
      "label": "PC_NAME2",
      "is_in": "ST_NAME",
      "name": "myneta Candidate",
      "party": "myneta Party",
      "education": "myneta E_1",
      "assets": "myneta Total Assets",
      "liabilities": "myneta Liabilities",
      "cases": "myneta Criminal Case",
      "category": "Res"
    }
  },
  "mla": {
    "label": "Assembly Constituencies",
    "layers": {
      "labels": ["ac label"],
      "points": ["ac circle"],
      "border": ["ac line border"],
      "base": ["ac fill base"]
    },
    "source": "mapbox://planemad.india-constituencies",
    "source-layer": "const_label",
    "fieldDict": {
      "id": "ac_code",
      "label": "PC_NAME2",
      "is_in_id": "ST_CODE" ,
      "name": "myneta Candidate",
      "party": "myneta Party",
    }
  },
  "local": {}
}

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
