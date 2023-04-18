import MapSourceModule, { MapSourceModuleOptions } from '@aerisweather/javascript-sdk/dist/modules/MapSourceModule';
export interface ObservationsOpts extends MapSourceModuleOptions {
}
declare class Observations extends MapSourceModule<ObservationsOpts> {
    private _request;
    private _weatherProp;
    private _units;
    get id(): string;
    constructor(opts?: ObservationsOpts);
    source(): any;
    controls(): any;
    legend(): any;
    infopanel(): any;
    onInit(): void;
    onAdd(): void;
    onRemove(): void;
    onMarkerClick(marker: any, data: any): void;
}
export default Observations;
