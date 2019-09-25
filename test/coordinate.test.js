'use strict';

const GeoCoordinate = require('../lib/index.js').GeoCoordinate;

const P1 = new GeoCoordinate([0, 0, 0]); //Do you know where this is? ;)
const P2 = new GeoCoordinate([52.0, 13.0, 0]);

function equalDecimal(expect, value, expected, delta, message) {
  const equal = Math.abs(value - expected) <= delta;
  expect(equal).toBe(
    true,
    message +
      ': actual value is not within epsilon |' +
      value +
      '-' +
      expected +
      '|>' +
      delta
  );
}
function degMinSecToDec(degree, minutes, seconds) {
  return degree + minutes / 60 + seconds / 3600;
}
const maxDelta = 0.0005;

// lat1, lon1, lat2, lon2, realDist
const goldDist = [
  [52.500235, 13.274623, 52.500199, 13.27458, 5.0],
  [52.500235, 13.274623, 52.50009, 13.274449, 20.0],
  [52.500235, 13.274623, 52.499882, 13.274166, 50.0],
  [52.500235, 13.274623, 52.499516, 13.273739, 100.0],
  [52.38632, 13.357304, 52.385123, 13.357218, 133.77],
  [52.38632, 13.357304, 52.384076, 13.358157, 258.22],
  [52.502095, 13.276632, 52.498444, 13.272332, 500.1],
  [52.388053, 13.347313, 52.38632, 13.357304, 700.68],
  [52.388053, 13.347313, 52.384076, 13.358157, 856.66],
  [52.494973, 13.267656, 52.502095, 13.276632, 1000.0],
  [52.388053, 13.347313, 52.365767, 13.327428, 2822.54],
  [52.388053, 13.347313, 52.308504, 13.600255, 19332.97]
];
// get reference calculation from http://www.movable-type.co.uk/scripts/latlong.html

describe('GeoCoordinate', () => {
  test('test distance implementations', () => {
    for (let i = 0; i < goldDist.length; i++) {
      const testData = goldDist[i];
      const p1 = new GeoCoordinate([testData[0], testData[1]]);
      const p2 = new GeoCoordinate([testData[2], testData[3]]);
      equalDecimal(
        expect,
        p1.distanceTo(p2),
        testData[4],
        testData[4] * 0.015,
        'too big deviation (distanceTo)'
      );
      equalDecimal(
        expect,
        p1.quickDistanceTo(p2),
        testData[4],
        testData[4] * 0.015,
        'too big deviation (quickDistanceTo)'
      );
    }
  });
  test('test get bearing north', () => {
    const north = new GeoCoordinate([3, 0, 0]);
    equalDecimal(
      expect,
      P1.bearingTo(north),
      0,
      0,
      'north direction should be 0°'
    );
    equalDecimal(
      expect,
      P1.bearingTo([3, 0, 0]),
      0,
      0,
      'north direction should be 0°'
    );
  });
  test('test different distance calculations', () => {
    const a = new GeoCoordinate([3, 0, 0]);
    const b = new GeoCoordinate([173.7373737, -83.1272, 0]);
    expect(a.preciseDistanceTo(b)).toEqual(10738778.34321367);
    expect(a.quickDistanceTo(b)).toEqual(19003344.421636105);
    expect(a.distanceTo([173.7373737, -83.1272, 0])).toEqual(10738778.34321367);
  });
  test('test 3d distance calculation', () => {
    const a = new GeoCoordinate([3, 0, 1213]);
    const b = new GeoCoordinate([173.7373737, -83.1272, 63]);
    expect(a.distance3DTo(b)).toEqual(19003344.45643261);
    expect(a.distance3DTo([173.7373737, -83.1272, 63])).toEqual(
      19003344.45643261
    );
  });
  test('test get bearing northeast', () => {
    const northeast = new GeoCoordinate([3, 3, 0]);
    equalDecimal(
      expect,
      P1.bearingTo(northeast),
      degMinSecToDec(44, 57, 39),
      maxDelta,
      'northeast not correctly calculated'
    );
  });
  test('test get bearing east', () => {
    const east = new GeoCoordinate([0, 120, 0]);
    equalDecimal(
      expect,
      P1.bearingTo(east),
      degMinSecToDec(90, 0, 0),
      0,
      'east not correctly calculated'
    );
  });
  test('test get bearing southeast', () => {
    const southeast = new GeoCoordinate([-10, 10, 0]);
    equalDecimal(
      expect,
      P1.bearingTo(southeast),
      degMinSecToDec(135, 26, 19),
      maxDelta,
      'southeast not correctly calculated'
    );
  });
  test('test get bearing southwest', () => {
    const southwest = new GeoCoordinate([-45, -13, 0]);
    equalDecimal(
      expect,
      P1.bearingTo(southwest),
      degMinSecToDec(192, 40, 40),
      maxDelta,
      'southwest not correctly calculated'
    );
    expect(P1.bearingRadTo(southwest)).toEqual(
      3.3628605082691405,
      'rad north should be calculated too'
    );
  });
  test('test get bearing almost north', () => {
    const north = new GeoCoordinate([80, -0.2, 0]);
    equalDecimal(
      expect,
      P1.bearingTo(north),
      degMinSecToDec(359, 57, 53),
      maxDelta,
      'almost north not correctly calculated'
    );
    expect(P1.bearingRadTo(north)).toEqual(
      6.282569811232558,
      'rad north should be calculated too'
    );
  });
  test('test get bearing almost north 2', () => {
    const north = new GeoCoordinate([52.5, 13.0, 0]);
    equalDecimal(
      expect,
      P2.bearingTo(north),
      degMinSecToDec(0, 0, 0),
      maxDelta,
      'almost north not correctly calculated'
    );
    expect(P2.bearingRadTo(north)).toEqual(
      0,
      'rad north should be calculated too'
    );
  });
  test('test get bearing northern hemisphers', () => {
    const bagdad = new GeoCoordinate([35, 45, 120]);
    const osaka = new GeoCoordinate([35, 135, 200]);
    equalDecimal(
      expect,
      bagdad.bearingTo(osaka),
      degMinSecToDec(60, 9, 45),
      maxDelta,
      'bagdad osaka not correctly calculated'
    );
  });
  test('test get altitude', () => {
    const bagdad = new GeoCoordinate([35, 45, 120]);
    equalDecimal(
      expect,
      bagdad.altitude(),
      120,
      0,
      "Bagdad altitude doesn't match"
    );
    const randomPoint = new GeoCoordinate([40, 24]);
    equalDecimal(
      expect,
      randomPoint.altitude(),
      0,
      0,
      "Default altitude isn't 0"
    );
  });
  test('test input as arguments', () => {
    expect(() => {
      new GeoCoordinate(null, 2, 3);
    }).toThrow();
    expect(() => {
      new GeoCoordinate(1);
    }).toThrow();
    expect(() => {
      new GeoCoordinate(5, 6);
      new GeoCoordinate(7, 8, 9);
    }).not.toThrow();
  });
  test('test input as array', () => {
    expect(() => {
      new GeoCoordinate([1]);
    }).toThrow();
    expect(() => {
      new GeoCoordinate([null, 1]);
    }).toThrow();
    expect(() => {
      new GeoCoordinate([1, 2, null]);
    }).toThrow();
    expect(() => {
      new GeoCoordinate([26, 42]);
    }).not.toThrow();
  });
  test('test input as object', () => {
    expect(() => {
      new GeoCoordinate({});
    }).toThrow();
    expect(() => {
      new GeoCoordinate({
        latitude: 0
      });
    }).toThrow();
    expect(() => {
      new GeoCoordinate({
        altitude: 0
      });
    }).toThrow();
    expect(() => {
      new GeoCoordinate({
        latitude: 'wow',
        altitude: 0
      });
    }).toThrow();
    expect(() => {
      new GeoCoordinate({
        latitude: 'string',
        longitude: 9999999,
        altitude: 0
      });
    }).toThrow();
    expect(() => {
      new GeoCoordinate({
        latitude: 0,
        longitude: 0,
        altitude: 0
      });
    }).not.toThrow();
  });
  test('test constructor usable as factory', () => {
    expect(() => {
      GeoCoordinate(1, 1);
    }).not.toThrow();
  });
  test('sort array by referencePoint', () => {
    const reference = new GeoCoordinate(0, 0);
    expect(
      reference.sortArrayByReferencePoint([[2, 2], [3, 1], [2, 1]])
    ).toEqual([[2, 1], [2, 2], [3, 1]], 'should be sorted');
  });
});
