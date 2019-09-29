# GeoCoordinate

[![NPM version](https://badge.fury.io/js/geocoordinate.svg)](http://badge.fury.io/js/geocoordinate) [![Actions Status](https://github.com/chrkaatz/GeoCoordinate/workflows/Node.js%20Package/badge.svg)](https://github.com/chrkaatz/GeoCoordinate/actions) [![Actions Status](https://github.com/chrkaatz/GeoCoordinate/workflows/Node%20CI/badge.svg)](https://github.com/chrkaatz/GeoCoordinate/actions)

a utility Library to create and work with GeoCoordinates

## Description

A tiny library to help you gettting things done with geospatial coordinates.

## Installation

    npm install geocoordinate

## Usage

```javascript
const {
    GeoCoordinate,
    BoundingBox
} = require('geocoordinate');

const brandenburgerTor = new GeoCoordinate([52.51626877497768, 13.377935641833488]);
const coord200mToNorth = brandenburgerTor.pointAtDistance(200, 0); // instance of GeoCoordinate: { coordinate: [ 52.518067418189524, 13.377935641833488 ] }

const potsdamerPlatz = new GeoCoordinate({
    latitude: 52.50947253231671,
    longitude: 13.37661188095808
});
brandenburgerTor.distanceTo(potsdamerPlatz); // 761.6555386291442
                                             // Distance in meters

const westminsterAbbay = new GeoCoordinate(51.499382976649365, -0.12724540716209276);

brandenburgerTor.quickDistanceTo(westminsterAbbay); // 932075.8108608712
brandenburgerTor.preciseDistanceTo(westminsterAbbay); // 930681.893582993


const oldBbox = new BoundingBox(); // Old way to instantiate BoundingBox, see below for more convenient method
bbox.pushCoordinate(52.51626877497768, 13.377935641833488);
bbox.pushCoordinate(51.499382976649365, -0.12724540716209276);

const newBbox = BoundingBox.fromCoordinates([52.51, 13.37], [51.49, -0.12])

newBbox.box();
/* {
    topLeftLatitude: 52.51,
    topLeftLongitude: -0.12,
    bottomRightLatitude: 51.49,
    bottomRightLongitude: 13.37
} */

newBbox.contains(52.50947253231671, 13.37661188095808); // true

oldBbox.centerLatitude();
// 52.00782587581352
oldBbox.centerLongitude();
// 6.625345117335698

```

## API

### GeoCoordinate

#### constructor
Usage:

```javascript

new GeoCoordinate([1,1]);
new GeoCoordinate(32, 17.4);
new GeoCoordinate(62.1, 24.3, 70); // Altitude = 70m
new GeoCoordinate({
    latitude: 6,
    longitude: 18
});

```

#### .asArray()

Returns array `[latitude, longitude[, altitude]]`.

#### .sortArrayByReferencePoint(arr)

Sorts `arr` in place by distance to reference point.

```javascript

const potsdamerPlatz = new GeoCoordinate({
    latitude: 52.50947253231671,
    longitude: 13.37661188095808
});

const arr = [
    [51, 23],
    {latitude: 54, longitude: 16},
    new GeoCoordinate(64, 32)
];
potsdamerPlatz.sortArrayByReferencePoint(arr);
// arr is sorted now

```

#### .quickDistanceTo(point)

Calculates quickly distance from `this` to `point`. Not recommended for long distances. Returns meters.

#### .preciseDistanceTo(point)

Calculates precise distance from `this` to `point`. Returns meters.

#### .distance3DTo(point)

Calculates a distance between two points, assuming they are on a plain area, correcting by actual latitude distortion.
Will produce bad results for long distances (>>500km) and points very close to the poles.

#### .pointAtDistance(distance, angle)

Calculates the coordinate that is a given number of meters from this coordinate at the given angle
*  @param {number} distance the distance in meters the new coordinate is way from this coordinate.
*  @param {number} bearing the angle in degrees at which the new point will be from the old point. In radians, clockwise from north.
*  @returns {GeoCoordinate} a new instance of this class with only the latitude and longitude set.

#### .bearingRadTo(distance, angleInRadians)

The same as `.pointAtDistance` but angle is given in radians.

#### .latitude()

Returns latitude of current point

#### .longitude()

Returns longitude of current point

#### .altitude()

Return altitude of the point or 0.

### BoundingBox

#### constructor

Constructor doesn't take arguments.

```javascript
const bb = new BoundingBox();
bb.pushCoordinate(52.51626877497768, 13.377935641833488);
bb.pushCoordinate({latitude: 44, longitude: 6});
```

#### fromCoordinates

```javascript
const bbox = BoundingBox.fromCoordinates([32, 53], [33, 54]);
```

#### .contains(point)


Checks if `point` is contained in bounding box.

```javascript
const bbox = BoundingBox.fromCoordinates([32, 53], [33, 54]);
bbox.contains(new GeoCoordinate(23, 44));
bbox.contains([32.5, 54.5]);
```


