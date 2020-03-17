import MapSourceModule from '@aerisweather/javascript-sdk/dist/modules/MapSourceModule';
import ApiRequest, { ApiAction } from '@aerisweather/javascript-sdk/dist/network/api/ApiRequest';
import { get, isset } from '@aerisweather/javascript-sdk/dist/utils';
import { Units, formatMeasurement } from '@aerisweather/javascript-sdk/dist/utils/units';
import { isLight } from '@aerisweather/javascript-sdk/dist/utils/color';

import { getColorRamp, colorForValue } from './colors';

const PropKey = {
	imperial: 0,
	metric: 1
};

const propMapping: { [key: string]: string[] } = {
	temps: ['tempF', 'tempC'],
	dewpt: ['dewpointF', 'dewpointC'],
	feelslike: ['feelslikeF', 'feelslikeC'],
	winds: ['windSpeedMPH', 'windSpeedKPH'],
	humidity: ['humidity', 'humidity'],
	precip: ['precipIN', 'precipMM'],
	sky: ['sky', 'sky']
};

const getObsProp = (type: string, isMetric: boolean = false): string => {
	const props = propMapping[type];
	if (!props) {
		return null;
	}
	return props[isMetric ? PropKey.metric : PropKey.imperial];
};

const shouldAllowMarker = (type: string, value: number): boolean => {
	if (!isset(value) || Number.isNaN(value)) {
		return false;
	}
	if (type === 'winds') {
		return value > 0;
	} else if (type === 'precip') {
		return value >= 0.01;
	}
	return true;
};

export type ObservationsOpts = {};

class Observations extends MapSourceModule {
	private _request: ApiRequest;
	private _weatherProp: string;
	private _units: Units;

    public get id() {
		return 'observations';
	}

	constructor(opts: ObservationsOpts = null) {
		super(opts);
	}

	source(): any {
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
				marker: (data: any) => {
					const isMetric = this._units === 'metric';
					const ob = data.ob;
					const type = this._weatherProp;
					const value = get(ob, getObsProp(type, false));
					const valueLabel = formatMeasurement(get(ob, getObsProp(type, isMetric)), type, isMetric);
					const valueColor = colorForValue(getColorRamp(type), value) || 'rgba(0,0,0,0)';

					// only render marker if we have a valid value
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
									color: isLight(valueColor) ? '#222222' : '#ffffff',
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
					}
				}
			}
		};
	}

	controls(): any {
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
					},{
						value: 'feelslike',
						title: 'Feels Like'
					},{
						value: 'winds',
						title: 'Winds'
					},{
						value: 'dewpt',
						title: 'Dew Point'
					},{
						value: 'humidity',
						title: 'Humidity'
					},{
						value: 'precip',
						title: 'Precipitation'
					},{
						value: 'sky',
						title: 'Sky Cover'
					}]
				},{
					id: 'units',
					title: 'Units',
					segments: [{
						value: 'imperial',
						title: 'Imperial'
					},{
						value: 'metric',
						title: 'Metric'
					}]
				}]
			}
		};
	}

	legend(): any {
		// Create and return the legend configuration for this module. If 'null' is returned, then
		// a legend will not be rendered when this module's map source is active.
		// re: https://www.aerisweather.com/docs/js/globals.html#legendoptions

		return null;
	}

	infopanel(): any {
		// Create and return the info panel configuration to associate with data loaded and
		// rendered by this module's map source. If a custom info panel view is not needed for this
		// module, just return 'null'.
		// re: https://www.aerisweather.com/support/docs/toolkits/aeris-js-sdk/interactive-map-app/info-panel/
		// re: https://www.aerisweather.com/docs/js/globals.html#infopanelviewsection

		return null;
	}

	onInit() {
		const request = this.account.api()
			.endpoint('observations')
			.action(ApiAction.WITHIN)
			.lod(this.map.getZoom())
			.filter('allstations,allownosky')
			.sort('id:1')
			.limit(1000);
		this._request = request;
		this._weatherProp = 'temps';
		this._units = this.map.isMetric ? Units.Metric : Units.Imperial;

		this.map.on('zoom', () => {
			this._request.lod(this.map.getZoom());
		}).on('change:units', (e: any) => {
			console.log('app units changed', e.data);
			// this._units =
		});

		this.app.on('layer:change:option', (e: any) => {
			const { id, value: { property, units } } = e.data || {};
			if (id === this.id) {
				this._weatherProp = property;
				this._units = units;
				this._request.fields(`id,loc,ob.dateTimeISO,ob.timestamp,ob.${getObsProp(property)},ob.${getObsProp(property, true)}`);
			}
		});
	}

	onAdd() {
		// Perform custom actions when the module's map source has been added to the map and is
		// active.
	}

	onRemove() {
		// Perform custom actions when the module's map source has been removed from the map and
		// is no longer active.
	}

	onMarkerClick(marker: any, data: any) {
		const { lat, long: lon } = data.loc || { lat: null, lon: null };
		if (isset(lat) && isset(lon)) {
			this.app.showInfoAtCoord({ lat, lon }, 'localweather', 'Local Weather');
		}
	}
}

export default Observations;
