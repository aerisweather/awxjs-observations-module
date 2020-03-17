"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _MapSourceModule = _interopRequireDefault(require("@aerisweather/javascript-sdk/dist/modules/MapSourceModule"));

var _ApiRequest = require("@aerisweather/javascript-sdk/dist/network/api/ApiRequest");

var _utils = require("@aerisweather/javascript-sdk/dist/utils");

var _units = require("@aerisweather/javascript-sdk/dist/utils/units");

var _color = require("@aerisweather/javascript-sdk/dist/utils/color");

var _colors = require("./colors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __extends = void 0 && (void 0).__extends || function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    };

    return extendStatics(d, b);
  };

  return function (d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var PropKey = {
  imperial: 0,
  metric: 1
};
var propMapping = {
  temps: ['tempF', 'tempC'],
  dewpt: ['dewpointF', 'dewpointC'],
  feelslike: ['feelslikeF', 'feelslikeC'],
  winds: ['windSpeedMPH', 'windSpeedKPH'],
  humidity: ['humidity', 'humidity'],
  precip: ['precipIN', 'precipMM'],
  sky: ['sky', 'sky']
};

var getObsProp = function (type, isMetric) {
  if (isMetric === void 0) {
    isMetric = false;
  }

  var props = propMapping[type];

  if (!props) {
    return null;
  }

  return props[isMetric ? PropKey.metric : PropKey.imperial];
};

var shouldAllowMarker = function (type, value) {
  if (!(0, _utils.isset)(value) || Number.isNaN(value)) {
    return false;
  }

  if (type === 'winds') {
    return value > 0;
  } else if (type === 'precip') {
    return value >= 0.01;
  }

  return true;
};

var Observations =
/** @class */
function (_super) {
  __extends(Observations, _super);

  function Observations(opts) {
    if (opts === void 0) {
      opts = null;
    }

    return _super.call(this, opts) || this;
  }

  Object.defineProperty(Observations.prototype, "id", {
    get: function () {
      return 'observations';
    },
    enumerable: true,
    configurable: true
  });

  Observations.prototype.source = function () {
    var _this = this;

    return {
      type: 'vector',
      refresh: 300,
      requiresBounds: true,
      data: {
        service: function () {
          return _this._request;
        },
        properties: {
          timestamp: 'periods.ob.timestamp'
        }
      },
      style: {
        marker: function (data) {
          var isMetric = _this._units === 'metric';
          var ob = data.ob;
          var type = _this._weatherProp;
          var value = (0, _utils.get)(ob, getObsProp(type, false));
          var valueLabel = (0, _units.formatMeasurement)((0, _utils.get)(ob, getObsProp(type, isMetric)), type, isMetric);
          var valueColor = (0, _colors.colorForValue)((0, _colors.getColorRamp)(type), value) || 'rgba(0,0,0,0)'; // only render marker if we have a valid value

          if (shouldAllowMarker(type, value)) {
            return {
              svg: {
                shape: {
                  type: 'circle',
                  fill: {
                    color: valueColor
                  },
                  stroke: {
                    color: '#ffffff',
                    width: 2
                  }
                },
                text: {
                  value: "" + valueLabel,
                  anchor: 'start',
                  position: 'center',
                  color: (0, _color.isLight)(valueColor) ? '#222222' : '#ffffff',
                  autosize: false,
                  translate: {
                    x: -0.5,
                    y: -2
                  }
                }
              },
              size: [30, 30]
            };
          }

          return {
            skip: true
          };
        }
      }
    };
  };

  Observations.prototype.controls = function () {
    return {
      value: this.id,
      title: 'Observations',
      filter: true,
      segments: {
        groups: [{
          id: 'property',
          title: 'Property',
          segments: [{
            value: 'temps',
            title: 'Temperatures'
          }, {
            value: 'feelslike',
            title: 'Feels Like'
          }, {
            value: 'winds',
            title: 'Winds'
          }, {
            value: 'dewpt',
            title: 'Dew Point'
          }, {
            value: 'humidity',
            title: 'Humidity'
          }, {
            value: 'precip',
            title: 'Precipitation'
          }, {
            value: 'sky',
            title: 'Sky Cover'
          }]
        }, {
          id: 'units',
          title: 'Units',
          segments: [{
            value: 'imperial',
            title: 'Imperial'
          }, {
            value: 'metric',
            title: 'Metric'
          }]
        }]
      }
    };
  };

  Observations.prototype.legend = function () {
    // Create and return the legend configuration for this module. If 'null' is returned, then
    // a legend will not be rendered when this module's map source is active.
    // re: https://www.aerisweather.com/docs/js/globals.html#legendoptions
    return null;
  };

  Observations.prototype.infopanel = function () {
    // Create and return the info panel configuration to associate with data loaded and
    // rendered by this module's map source. If a custom info panel view is not needed for this
    // module, just return 'null'.
    // re: https://www.aerisweather.com/support/docs/toolkits/aeris-js-sdk/interactive-map-app/info-panel/
    // re: https://www.aerisweather.com/docs/js/globals.html#infopanelviewsection
    return null;
  };

  Observations.prototype.onInit = function () {
    var _this = this;

    var request = this.account.api().endpoint('observations').action(_ApiRequest.ApiAction.WITHIN).lod(this.map.getZoom()).filter('allstations,allownosky').sort('id:1').limit(1000);
    this._request = request;
    this._weatherProp = 'temps';
    this._units = this.map.isMetric ? _units.Units.Metric : _units.Units.Imperial;
    this.map.on('zoom', function () {
      _this._request.lod(_this.map.getZoom());
    }).on('change:units', function (e) {
      console.log('app units changed', e.data); // this._units =
    });
    this.app.on('layer:change:option', function (e) {
      var _a = e.data || {},
          id = _a.id,
          _b = _a.value,
          property = _b.property,
          units = _b.units;

      if (id === _this.id) {
        _this._weatherProp = property;
        _this._units = units;

        _this._request.fields("id,loc,ob.dateTimeISO,ob.timestamp,ob." + getObsProp(property) + ",ob." + getObsProp(property, true));
      }
    });
  };

  Observations.prototype.onAdd = function () {// Perform custom actions when the module's map source has been added to the map and is
    // active.
  };

  Observations.prototype.onRemove = function () {// Perform custom actions when the module's map source has been removed from the map and
    // is no longer active.
  };

  Observations.prototype.onMarkerClick = function (marker, data) {
    var _a = data.loc || {
      lat: null,
      lon: null
    },
        lat = _a.lat,
        lon = _a.long;

    if ((0, _utils.isset)(lat) && (0, _utils.isset)(lon)) {
      this.app.showInfoAtCoord({
        lat: lat,
        lon: lon
      }, 'localweather', 'Local Weather');
    }
  };

  return Observations;
}(_MapSourceModule.default);

var _default = Observations;
exports.default = _default;
module.exports = exports.default;