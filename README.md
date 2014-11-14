GeoCoordinate
=============

[![NPM version](https://badge.fury.io/js/GeoCoordinate.svg)](http://badge.fury.io/js/GeoCoordinate)[![Build Status](https://travis-ci.org/ckaatz-nokia/GeoCoordinate.svg?branch=master)](https://travis-ci.org/ckaatz-nokia/GeoCoordinate)

a utility Library to create and work with GeoCoordinates

Description
-----------
A tiny library to help you gettting things done with geospatial coordinates.

Installation
------------

    $ npm install geocoordinate

Usage
-----

    var GeoCoordinate = require('geocoordinate');
    var brandenburgerTor = new GeoCoordinate([52.51626877497768, 13.377935641833488]);

Methods
-------

## Constructor options

Either an array like [latitude, longitude(, altitude)] or an object with those values

## Methods

* .latitude(): Return the point's latitude in degrees
* .longitude(): Return the point's longitude in degrees
* .altitude(): Return the point's altitude in meters
* .isSet(): returns whether the instance is properly instanciated
* .sortArrayByReferencePoint(array): sorts an array related to your reference point
* .distanceTo(GeoCoordinate(, force)): Calculate the distance to a given point, setting force, will calculate it faster but less accurate
* .distance3DTo(GeoCoordinate): Calculates the 3d distance to a given point
* .pointAtDistance(distance, bearing): Returns a new Point based on the distance in meters and a given angle
* .bearingRadTo(GeoCoordinate): Calculates the bearing from this coordinate to a given one in radians
* .bearingTo(GeoCoordinate): Calculates the bearing from this coordinate to a given one in degree

Running Tests
-------------

  $ npm test