import 'ol/ol.css';
import Map from 'ol/Map';

import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorImageLayer from 'ol/layer/VectorImage';
import LayerGroup from 'ol/layer/Group';

import View from 'ol/View';
import {Circle as CircleStyle, Fill, Stroke, Style, Text, Icon} from 'ol/style';

import {OSM, Vector as VectorSource} from 'ol/source';
import XYZ from 'ol/source/XYZ';
import TileJSON from 'ol/source/TileJSON';
import VectorTileSource from 'ol/source/VectorTile';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

import Geolocation from 'ol/Geolocation';
import Draw from 'ol/interaction/Draw';
import {useGeographic} from 'ol/proj';
import Overlay from 'ol/Overlay';

import MVT from 'ol/format/MVT';
// geojson
import GeoJSON from 'ol/format/GeoJSON';
import OlFormatGeoJSON from 'ol/format/GeoJSON';

//data
import federalStates from './data/geojson/federal-states-ger.json';
import TaichungCity from './data/geojson/map.geojson';
import LineSamples from './data/geojson/line-samples.geojson';
import PointSamples from './data/geojson/point-samples.geojson';
import PolygonSamples from './data/geojson/polygon-samples.geojson';

//icon
import LocationIcon from './data1/position.svg'

import {toStringHDMS} from 'ol/coordinate';
import {toLonLat} from 'ol/proj';


const format = new OlFormatGeoJSON();
const features = format.readFeatures(federalStates);
var twVector = new VectorLayer({
  source: new VectorSource({
    features: features
  })
})

const mapView = new View({
  projection: 'EPSG:4326',
  center: [120.3552, 23.65],
  zoom: 8,
})

const map = new Map({
  view: mapView,
  target: 'map'
})

//Basemaps Layers
const openStreetMapStandard = new TileLayer({
  source: new OSM(),
  visible: false,
  title: 'OSMStandard'
})

const openStreetMapHumanitarian = new TileLayer({
  source: new OSM({
    // url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
  }),
  visible: false,
  title: 'OSMHumanitarian'
})

const stamenTerrain = new TileLayer({
  source: new XYZ({
    url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
    // attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> — Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
  }),
  visible: false,
  title: 'StamenTerrain'
})

const mapBox = new TileLayer({
  source: new TileJSON({
    url: 'https://a.tiles.mapbox.com/v3/aj.1x1-degrees.json',
    crossOrigin: ''
  }),
  visible: false,
  title: 'mapBox'
})

//Layer Group
const baseLayerGroup = new LayerGroup({
  layers: [
    openStreetMapStandard,
    openStreetMapHumanitarian,
    stamenTerrain,
    mapBox
  ]
})

// lookup for selection objects
var selection = {};
var vtLayer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    maxZoom: 15,
    format: new MVT({
      idProperty: 'iso_a3'
    }),
    url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
      'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
  }),
  style: function(feature) {
    var selected = !!selection[feature.getId()];
    return new Style({
      stroke: new Stroke({
        color: selected ? 'rgba(200,20,20,0.8)' : 'gray',
        width: selected ? 2 : 1
      }),
      fill: new Fill({
        color: selected ? 'rgba(200,20,20,0.2)' : 'rgba(20,20,20,0.9)'
      })
    })
  },
  visible: true,
  title: 'vtLayer'
});
map.addLayer(baseLayerGroup)
map.addLayer(vtLayer)

console.log(map.getLayers())


// map tile
var mapSelect = document.getElementById('map_type');

mapSelect.onchange = function() {
  console.log(mapSelect.value)
  baseLayerGroup.getLayers().forEach(function(element, index, array){

    let baseLayerTile = element.get('title')
    console.log(baseLayerTile)
    element.setVisible( baseLayerTile == mapSelect.value )
  })
};

var iconFeature = new Feature({
  geometry: new Point([120.685524, 24.171621]),
  name: 'Taolin',
  population: 4000,
  rainfall: 500
});
var iconStyle = new Style({
  image: new Icon({
      anchor: [1, 0],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      // src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Map_marker_font_awesome.svg/200px-Map_marker_font_awesome.svg.png',
      src: LocationIcon,
      // imgSize: new olSize(50)
      opacity: 1,
      // the real size of your icon
      // size: [100, 100],
      // the scale factor
      scale: 0.2,
      offset: [1,0]
  })
});

iconFeature.setStyle(iconStyle);
var iconVector = new VectorLayer({
  source: new VectorSource({
    features: [iconFeature]
  }),
})

map.addLayer(iconVector)

// map.on("moveend", () => {
//   let center = map.getView().getCenter();
//   let zoom = map.getView().getZoom();
//   console.log(center)
//   console.log(zoom)
//   mapView.center= center
//   mapView.zoom= zoom
// });

document.getElementById('userAction')
  .addEventListener('click', function() {
    mapView.center= [120.3552, 23.65]
    mapView.zoom= 8
    let center = map.getView().getCenter();
    let zoom = map.getView().getZoom();
    // mapView.centerOn(point.getCoordinates(), size, mapView.center);
    mapView.setCenter(mapView.center)
    mapView.setZoom( mapView.zoom)
    // map.flyTo([23.707208, 120.651896, 8]);
  });

// document.getElementById('selectMap')
// .addEventListener('click', function() {
//   console.log("456")
//   mapLayers.setSource(new TileJSON({
//     url: 'https://a.tiles.mapbox.com/v3/aj.1x1-degrees.json',
//     crossOrigin: ''
//   }))
// });

document.getElementById('nowLocation')
.addEventListener('click', function() {
  console.log("456")
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.")
  }
});

function showPosition(position) {
  console.log(position)
  // x.innerHTML = "Latitude: " + position.coords.latitude +
  // "<br>Longitude: " + position.coords.longitude;
  mapView.center= [position.coords.longitude, position.coords.latitude]
  mapView.zoom= 15
  let center = map.getView().getCenter();
  let zoom = map.getView().getZoom();
  mapView.setCenter(mapView.center)
  mapView.setZoom( mapView.zoom)

  var feature = source.getFeatures()[1];
  var point = feature.getGeometry();
  var size = map.getSize();
  view.centerOn(point.getCoordinates(), size,  [position.coords.longitude, position.coords.latitude]);
}

document.getElementById('TWCity')
.addEventListener('click', function() {
  if (document.getElementById('TWCity').checked) 
  {
    map.addLayer(twVector)
  } else {
    map.removeLayer(twVector)
  }
});

const fillStyle = new Fill({
  color: [84, 118, 255, 1]
})

const strokeStyle = new Stroke({
  color: [46, 45, 45, 1],
  width:1.2
})

const circleStyle = new CircleStyle({
  fill: new Fill({
    color: [245, 49, 5, 1]
  }),
  radius: 7,
  stroke: strokeStyle
})

const TaichungCityGeoJson = new VectorImageLayer({
  source: new VectorSource({
    url: TaichungCity,
    format: new OlFormatGeoJSON()
  }),
  visible: true,
  tittle: 'TaichungCityGeoJson',
  style: new Style({
    fill: fillStyle,
    stroke: strokeStyle,
    image: circleStyle,
  })
})
document.getElementById('Country')
.addEventListener('click', function() {
  if (document.getElementById('Country').checked) 
  {
    map.addLayer(TaichungCityGeoJson)
  } else {
    map.removeLayer(TaichungCityGeoJson)
  }
});

//Vector Feature Popup Logic
const overlayContainerElement = document.querySelector('.overlay-container')
const overlayLayer = new Overlay({
  element: overlayContainerElement
})
map.addOverlay(overlayLayer)
const overlayFeatureName = document.getElementById('feature-name')
const overlayFeatureAdditionInfo = document.getElementById('feature-additional-info')

var selectElement = document.getElementById('type');

map.on('click', function(e){
  overlayLayer.setPosition(undefined)
  console.log(e)
  map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
    // console.log(feature.getKeys())
    let clickedCoordinate = e.coordinate
    let clickedFeatureName = feature.get('name')
    let clickedFeatureAdditionalinfo = feature.get('additionalinfo')

    overlayLayer.setPosition(clickedCoordinate)
    overlayFeatureName.innerHTML = clickedFeatureName
    overlayFeatureAdditionInfo.innerHTML = clickedFeatureAdditionalinfo

  },{
    layerFilter: function(layerCandidate){
      return layerCandidate.get('tittle')==='TaichungCityGeoJson'
    }
  })

  vtLayer.getFeatures(e.pixel).then(function(features) {
    // console.log(features.length)
    if (!features.length) {
      selection = {};
      // force redraw of layer style
      vtLayer.setStyle(vtLayer.getStyle());
      return;
    }
    var feature = features[0];
    if (!feature) {
      return;
    }
    var fid = feature.getId();

    if (selectElement.value === 'singleselect') {
      selection = {};
    }
    // add selected feature to lookup
    selection[fid] = feature;

    // force redraw of layer style
    vtLayer.setStyle(vtLayer.getStyle());
  });
})

/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup-all');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
/**
 * Create an overlay to anchor the popup to the map.
 */
var overlayAll = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
  overlayAll.setPosition(undefined);
  closer.blur();
  return false;
};

/**
 * Create the map.
 */
// var map = new Map({
//   layers: [
//     new TileLayer({
//       source: new TileJSON({
//         url: 'https://api.tiles.mapbox.com/v4/mapbox.natural-earth-hypso-bathy.json?access_token=' + key,
//         crossOrigin: 'anonymous'
//       })
//     })
//   ],
//   overlays: [overlay],
//   target: 'map',
//   view: new View({
//     center: [0, 0],
//     zoom: 2
//   })
// });
map.addOverlay(overlayAll)
/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function(evt) {
  var coordinate = evt.coordinate;
  // var hdms = toStringHDMS(toLonLat(coordinate));
  var hdms = toStringHDMS(coordinate);
  console.log(hdms)
  content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
      '</code>';
      overlayAll.setPosition(coordinate);
});

var openSansAdded = false;

var myDom = {
  points: {
    text: document.getElementById('points-text'),
    align: document.getElementById('points-align'),
    baseline: document.getElementById('points-baseline'),
    rotation: document.getElementById('points-rotation'),
    font: document.getElementById('points-font'),
    weight: document.getElementById('points-weight'),
    size: document.getElementById('points-size'),
    height: document.getElementById('points-height'),
    offsetX: document.getElementById('points-offset-x'),
    offsetY: document.getElementById('points-offset-y'),
    color: document.getElementById('points-color'),
    outline: document.getElementById('points-outline'),
    outlineWidth: document.getElementById('points-outline-width'),
    maxreso: document.getElementById('points-maxreso')
  },
  lines: {
    text: document.getElementById('lines-text'),
    align: document.getElementById('lines-align'),
    baseline: document.getElementById('lines-baseline'),
    rotation: document.getElementById('lines-rotation'),
    font: document.getElementById('lines-font'),
    weight: document.getElementById('lines-weight'),
    placement: document.getElementById('lines-placement'),
    maxangle: document.getElementById('lines-maxangle'),
    overflow: document.getElementById('lines-overflow'),
    size: document.getElementById('lines-size'),
    height: document.getElementById('lines-height'),
    offsetX: document.getElementById('lines-offset-x'),
    offsetY: document.getElementById('lines-offset-y'),
    color: document.getElementById('lines-color'),
    outline: document.getElementById('lines-outline'),
    outlineWidth: document.getElementById('lines-outline-width'),
    maxreso: document.getElementById('lines-maxreso')
  },
  polygons: {
    text: document.getElementById('polygons-text'),
    align: document.getElementById('polygons-align'),
    baseline: document.getElementById('polygons-baseline'),
    rotation: document.getElementById('polygons-rotation'),
    font: document.getElementById('polygons-font'),
    weight: document.getElementById('polygons-weight'),
    placement: document.getElementById('polygons-placement'),
    maxangle: document.getElementById('polygons-maxangle'),
    overflow: document.getElementById('polygons-overflow'),
    size: document.getElementById('polygons-size'),
    height: document.getElementById('polygons-height'),
    offsetX: document.getElementById('polygons-offset-x'),
    offsetY: document.getElementById('polygons-offset-y'),
    color: document.getElementById('polygons-color'),
    outline: document.getElementById('polygons-outline'),
    outlineWidth: document.getElementById('polygons-outline-width'),
    maxreso: document.getElementById('polygons-maxreso')
  }
};

var getText = function(feature, resolution, dom) {
  var type = dom.text.value;
  var maxResolution = dom.maxreso.value;
  var text = feature.get('name');

  if (resolution > maxResolution) {
    text = '';
  } else if (type == 'hide') {
    text = '';
  } else if (type == 'shorten') {
    text = text.trunc(12);
  } else if (type == 'wrap' && (!dom.placement || dom.placement.value != 'line')) {
    text = stringDivider(text, 16, '\n');
  }

  return text;
};


var createTextStyle = function(feature, resolution, dom) {
  var align = dom.align.value;
  var baseline = dom.baseline.value;
  var size = dom.size.value;
  var height = dom.height.value;
  var offsetX = parseInt(dom.offsetX.value, 10);
  var offsetY = parseInt(dom.offsetY.value, 10);
  var weight = dom.weight.value;
  var placement = dom.placement ? dom.placement.value : undefined;
  var maxAngle = dom.maxangle ? parseFloat(dom.maxangle.value) : undefined;
  var overflow = dom.overflow ? (dom.overflow.value == 'true') : undefined;
  var rotation = parseFloat(dom.rotation.value);
  if (dom.font.value == '\'Open Sans\'' && !openSansAdded) {
    var openSans = document.createElement('link');
    openSans.href = 'https://fonts.googleapis.com/css?family=Open+Sans';
    openSans.rel = 'stylesheet';
    document.getElementsByTagName('head')[0].appendChild(openSans);
    openSansAdded = true;
  }
  var font = weight + ' ' + size + '/' + height + ' ' + dom.font.value;
  var fillColor = dom.color.value;
  var outlineColor = dom.outline.value;
  var outlineWidth = parseInt(dom.outlineWidth.value, 10);

  return new Text({
    textAlign: align == '' ? undefined : align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution, dom),
    fill: new Fill({color: fillColor}),
    stroke: new Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: offsetX,
    offsetY: offsetY,
    placement: placement,
    maxAngle: maxAngle,
    overflow: overflow,
    rotation: rotation
  });
};


// Polygons
function polygonStyleFunction(feature, resolution) {
  return new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 1
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    }),
    text: createTextStyle(feature, resolution, myDom.polygons)
  });
}

var vectorPolygons = new VectorLayer({
  source: new VectorSource({
    url: PolygonSamples,
    format: new GeoJSON()
  }),
  style: polygonStyleFunction
});


// Lines
function lineStyleFunction(feature, resolution) {
  return new Style({
    stroke: new Stroke({
      color: 'green',
      width: 2
    }),
    text: createTextStyle(feature, resolution, myDom.lines)
  });
}

var vectorLines = new VectorLayer({
  source: new VectorSource({
    url: LineSamples,
    format: new GeoJSON()
  }),
  style: lineStyleFunction
});


// Points
function pointStyleFunction(feature, resolution) {
  return new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({color: 'rgba(255, 0, 0, 0.1)'}),
      stroke: new Stroke({color: 'red', width: 1})
    }),
    text: createTextStyle(feature, resolution, myDom.points)
  });
}

var vectorPoints = new VectorLayer({
  source: new VectorSource({
    url: PointSamples,
    format: new GeoJSON()
  }),
  style: pointStyleFunction
});


map.addLayer(vectorPolygons)
map.addLayer(vectorLines)
map.addLayer(vectorPoints)

document.getElementById('refresh-points')
  .addEventListener('click', function() {
    vectorPoints.setStyle(pointStyleFunction);
  });

document.getElementById('refresh-lines')
  .addEventListener('click', function() {
    vectorLines.setStyle(lineStyleFunction);
  });

document.getElementById('refresh-polygons')
  .addEventListener('click', function() {
    vectorPolygons.setStyle(polygonStyleFunction);
  });


/**
 * @param {number} n The max number of characters to keep.
 * @return {string} Truncated string.
 */
String.prototype.trunc = String.prototype.trunc ||
    function(n) {
      return this.length > n ? this.substr(0, n - 1) + '...' : this.substr(0);
    };


// http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
function stringDivider(str, width, spaceReplacer) {
  if (str.length > width) {
    var p = width;
    while (p > 0 && (str[p] != ' ' && str[p] != '-')) {
      p--;
    }
    if (p > 0) {
      var left;
      if (str.substring(p, p + 1) == '-') {
        left = str.substring(0, p + 1);
      } else {
        left = str.substring(0, p);
      }
      var right = str.substring(p + 1);
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
}