"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getColorRamp = exports.colorForValue = exports.weather = void 0;
var weather = {
  temps: {
    '-60': '#8f00ca',
    '-50': '#630078',
    '-40': '#a50099',
    '-30': '#ed00dc',
    '-20': '#f671ff',
    '-10': '#dcc1ed',
    '0': '#1b007b',
    '10': '#6e51ff',
    '20': '#9bb6ff',
    '30': '#18a5fc',
    '40': '#0900e7',
    '50': '#14b000',
    '60': '#f5d508',
    '70': '#e17200',
    '80': '#f33300',
    '90': '#d00000',
    '100': '#720000',
    '110': '#ce0046',
    '120': '#ff4b98'
  },
  winds: {
    '1': '#0050ff',
    '10': '#34ff87',
    '20': '#fee20a',
    '30': '#ed9909',
    '40': '#fd5d08',
    '50': '#fb311b',
    '60': '#fb2b36',
    '70': '#fb4d53',
    '80': '#fd7074',
    '90': '#f48688',
    '100': '#ec9a9c'
  },
  dewpt: {
    '-40': '#5943ac',
    '-30': '#5559bc',
    '-20': '#8d95e8',
    '-10': '#8d94c5',
    '0': '#555555',
    '10': '#675b4d',
    '20': '#7b6652',
    '30': '#927865',
    '40': '#a59c96',
    '50': '#5ee243',
    '60': '#14b300',
    '70': '#0e5e00',
    '80': '#93a600',
    '90': '#fff800'
  },
  humidity: {
    '0': '#4b2b18',
    '10': '#634a3b',
    '20': '#7c695e',
    '30': '#958881',
    '40': '#aea7a4',
    '50': '#c7c7c7',
    '60': '#6aea55',
    '70': '#18d200',
    '80': '#14ab00',
    '90': '#118400',
    '100': '#0e5e00'
  },
  precip: {
    '0': 'rgba(0,0,0,0.2)',
    '0.01': '#deffd6',
    '0.1': '#bbffab',
    '0.25': '#9af480',
    '0.5': '#7aea55',
    '0.75': '#59df2a',
    '1': '#39d500',
    '1.25': '#2fb700',
    '1.5': '#259901',
    '1.75': '#1b7b02',
    '2': '#125d03',
    '2.25': '#4d8506',
    '2.5': '#88ae09',
    '2.75': '#c3d60c',
    '3': '#ffff0f',
    '3.25': '#fed90b',
    '3.5': '#feb407',
    '3.75': '#fd8f03',
    '4': '#fd6a00',
    '4.25': '#f95c00',
    '4.5': '#f54f00',
    '4.75': '#f14200',
    '5': '#ee3500',
    '5.25': '#ea2700',
    '5.5': '#e61a00',
    '5.75': '#e20d00',
    '6': '#df0000',
    '6.25': '#d20000',
    '6.5': '#c60000',
    '6.75': '#b90000',
    '7': '#ad0000',
    '7.25': '#a00000',
    '7.5': '#940000',
    '7.75': '#870000',
    '8': '#7b0000',
    '8.25': '#88001c',
    '8.5': '#960038',
    '8.75': '#a30054',
    '9': '#b10070',
    '9.25': '#bf008c',
    '9.5': '#cc00a8',
    '9.75': '#da00c4',
    '10': '#e800e0'
  },
  snow: {
    '0': 'rgba(0,0,0,0.2)',
    '0.01': '#dadada',
    '0.5': '#ababab',
    '1': '#baebff',
    '6': '#3e82ff',
    '12': '#4e00c3',
    '18': '#a100a9',
    '24': '#f40090'
  },
  sky: {
    '0': '#ffffff',
    '10': '#e8e8e8',
    '20': '#d2d2d2',
    '30': '#bcbcbc',
    '40': '#a7a7a7',
    '50': '#929292',
    '60': '#7e7e7e',
    '70': '#6a6a6a',
    '80': '#575757',
    '90': '#454545',
    '100': '#333333'
  }
};
exports.weather = weather;
weather.feelslike = weather.temps;

var colorForValue = function (ramp, value) {
  var color = null;
  if (!ramp) return null;
  var sortedKeys = Object.keys(ramp).map(function (el) {
    return parseFloat(el);
  }).sort(function (a, b) {
    return a - b;
  });
  sortedKeys.forEach(function (key) {
    if (key <= value) {
      color = ramp[key];
    }
  });
  return color;
};

exports.colorForValue = colorForValue;

var getColorRamp = function (type) {
  return weather[type];
};

exports.getColorRamp = getColorRamp;