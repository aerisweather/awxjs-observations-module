"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _MapSourceModule = _interopRequireDefault(require("@aerisweather/javascript-sdk/dist/modules/MapSourceModule"));

var _utils = require("@aerisweather/javascript-sdk/dist/utils");

var _units = require("@aerisweather/javascript-sdk/dist/utils/units");

var _color = require("@aerisweather/javascript-sdk/dist/utils/color");

var _colors = require("./colors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PropKey = {
  imperial: 0,
  metric: 1
};
const propMapping = {
  temps: ['tempF', 'tempC'],
  dewpt: ['dewpointF', 'dewpointC'],
  feelslike: ['feelslikeF', 'feelslikeC'],
  winds: ['windSpeedMPH', 'windSpeedKPH'],
  humidity: ['humidity', 'humidity'],
  precip: ['precipIN', 'precipMM'],
  sky: ['sky', 'sky']
};

const getObsProp = (type, isMetric = false) => {
  const props = propMapping[type];

  if (!props) {
    return null;
  }

  return props[isMetric ? PropKey.metric : PropKey.imperial];
};

const shouldAllowMarker = (type, value) => {
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

;

class Observations extends _MapSourceModule.default {
  constructor(opts = null) {
    super(opts);
  }

  get id() {
    return 'observations';
  }

  source() {
    return {
      type: 'vector',
      refresh: 300,
      requiresBounds: true,
      data: {
        service: () => {
          return this._request;
        },
        properties: {
          timestamp: 'periods.ob.timestamp'
        }
      },
      style: {
        marker: data => {
          const isMetric = this._units === 'metric';
          const ob = data.ob;
          const type = this._weatherProp;
          const value = (0, _utils.get)(ob, getObsProp(type, false));
          const valueLabel = (0, _units.formatMeasurement)((0, _utils.get)(ob, getObsProp(type, isMetric)), type, isMetric);
          const valueColor = (0, _colors.colorForValue)((0, _colors.getColorRamp)(type), value) || 'rgba(0,0,0,0)'; // only render marker if we have a valid value

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
                  value: `${valueLabel}`,
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
  }

  controls() {
    return {
      value: this.id,
      title: 'Observations',
      filter: true,
      multiselect: false,
      reloadOnChange: false,
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
  }

  legend() {
    // Create and return the legend configuration for this module. If 'null' is returned, then
    // a legend will not be rendered when this module's map source is active.
    // re: https://www.aerisweather.com/docs/js/globals.html#legendoptions
    return null;
  }

  infopanel() {
    // Create and return the info panel configuration to associate with data loaded and
    // rendered by this module's map source. If a custom info panel view is not needed for this
    // module, just return 'null'.
    // re: https://www.aerisweather.com/support/docs/toolkits/aeris-js-sdk/interactive-map-app/info-panel/
    // re: https://www.aerisweather.com/docs/js/globals.html#infopanelviewsection
    return null;
  }

  onInit() {
    const props = ['temps', 'feelslike', 'winds', 'dewpt', 'humidity', 'precip', 'sky'].map(type => `ob.${getObsProp(type)},ob.${getObsProp(type, true)}`);
    const request = this.account.api().endpoint('observations').action("within"
    /* WITHIN */
    ).lod(this.map.getZoom()).fields(`id,loc,ob.dateTimeISO,ob.timestamp,${props.join(',')}}`).filter('allstations,allownosky').sort('id:1').limit(1000);
    this._request = request;
    this._weatherProp = 'temps';
    this._units = this.map.isMetric ? "metric"
    /* Metric */
    : "imperial"
    /* Imperial */
    ;
    this.map.on('zoom', () => {
      this._request.lod(this.map.getZoom());
    }).on('change:units', e => {// console.log('app units changed', e.data);
    });
    this.app.on('layer:change', e => {
      const {
        id,
        source,
        value
      } = e.data || {};

      if (id === this.id) {
        const {
          property,
          units
        } = value;
        this._weatherProp = property;
        this._units = units;
        let update = false;

        if (source) {
          if (update) {
            source.reload();
          } else {
            source.render();
          }
        }
      }
    });
  }

  onAdd() {// Perform custom actions when the module's map source has been added to the map and is
    // active.
  }

  onRemove() {// Perform custom actions when the module's map source has been removed from the map and
    // is no longer active.
  }

  onMarkerClick(marker, data) {
    const {
      lat,
      long: lon
    } = data.loc || {
      lat: null,
      lon: null
    };

    if ((0, _utils.isset)(lat) && (0, _utils.isset)(lon)) {
      this.app.showInfoAtCoord({
        lat,
        lon
      }, 'localweather', 'Local Weather');
    }
  }

}

var _default = Observations;
exports.default = _default;
module.exports = exports.default;