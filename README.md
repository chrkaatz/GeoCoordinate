GeoCoordinate
=============

[![NPM version](https://badge.fury.io/js/geocoordinate.svg)](http://badge.fury.io/js/geocoordinate)  [![Build Status](https://travis-ci.org/ckaatz-here/GeoCoordinate.svg?branch=master)](https://travis-ci.org/ckaatz-here/GeoCoordinate)

a utility Library to create and work with GeoCoordinates

Description
-----------
A tiny library to help you gettting things done with geospatial coordinates.

Installation
------------

    $ npm install geocoordinate

Usage
-----
    
    /* working with geocoordinates */
    var GeoCoordinate = require('geocoordinate').GeoCoordinate;
    var brandenburgerTor = new GeoCoordinate([52.51626877497768, 13.377935641833488]);
    
    // get coordinate 200 m to north
    var coord200mToNorth = brandenburgerTor.pointAtDistance(200, 0);
    // { coordinate: [ 52.518067418189524, 13.377935641833488 ] }

    // what is the distance between two points
    var potsdamerPlatz = new GeoCoordinate({
        latitude: 52.50947253231671, 
        longitude: 13.37661188095808
    });
    brandenburgerTor.distanceTo(potsdamerPlatz);
    // 761.6555386291442

    // lets compare distance functions a bit more far away
    var westminsterAbbay = new GeoCoordinate([51.499382976649365, -0.12724540716209276]);
    brandenburgerTor.distanceTo(westminsterAbbay, true);
    // 930681.893582993 m -> 930.681 km
    brandenburgerTor.distance3DTo(westminsterAbbay);
    // 932075.8108608712 m -> 932.075km

    /* working with boundingboxes */
    var BoundingBox = require('geocoordinate').BoundingBox;
    var bbox = new BoundingBox();
    bbox.pushCoordinate(52.51626877497768, 13.377935641833488);
    bbox.pushCoordinate(51.499382976649365, -0.12724540716209276);

    bbox.box();
    /* { 
        topLeftLatitude: 52.51626877497768,
        topLeftLongitude: -0.12724540716209276,
        bottomRightLatitude: 51.499382976649365,
        bottomRightLongitude: 13.377935641833488 
    } */

    bbox.contains(52.50947253231671, 13.37661188095808);
    // true

    bbox.hasCoordinates();
    // true

    bbox.centerLatitude();
    // 52.00782587581352
    bbox.centerLongitude();
    // 6.625345117335698

    var containedBbox = new BoundingBox();
    bbox.containCircle(containedBbox, 1000);

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

## BoundingBox methods

* .containCircle(GeoCoordinate, radius): Generates a bounding box containing the circle defined by the centre and radius (in metres)

Running Tests
-------------

  $ npm test