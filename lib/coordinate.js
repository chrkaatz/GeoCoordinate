'use strict';
const _ = require('lodash');


/**
 An object coercible to GeoCoordinate
 @typedef {object} coordinateObject
 @type {object}
 @property {number} latitude
 @property {number} longitude
 @property {number} [altitude]

 Any value coercible to GeoCoordinate
 @typedef {GeoCoordinate|number[]|coordinateObject} coordinate
 */



const D2R = (Math.PI / 180.0);
/** earth radius in m */
const R = 6376500;
const mPerDegree = 2 * Math.PI * R / 360;
const minDegreeDeviation = 6;

/**
 * @param {coordinate} coordinate
 */
function GeoCoordinate(coordinate) {
    if (!(this instanceof GeoCoordinate)) {
        // Reflect.construct would be better, but it requires Node 6
        return new (GeoCoordinate.bind.apply(GeoCoordinate, arguments))(coordinate);
    }
    if (coordinate instanceof GeoCoordinate) {
        this._coordinate = coordinate.asArray();
        return this;
    }
    assertNotEmpty(coordinate);
    if (Array.isArray(coordinate)) {
        this._coordinate = parseCoordinateArray(coordinate);
    } else if (isCoordinateObject(coordinate)) {
        this._coordinate = parseCoordinateObject(coordinate);
    } else {
        return new GeoCoordinate([].slice.call(arguments));
    }
}

GeoCoordinate.fromArguments = function(arg) {
    if (arg.length === 2) {
        return new GeoCoordinate(arg[0], arg[1]);
    } else if (arg.length === 1) {
        return new GeoCoordinate(arg[0]);
    } else {
        return GeoCoordinate.apply(null, arg);
    }
};

function parseCoordinateArray(coordinate) {
    if ((coordinate.length === 2 || coordinate.length === 3) && coordinate.every(Number.isFinite)) {
        return coordinate.slice();
    } else {
        throw new TypeError('Invalid array passed to GeoCoordinate constructor: [' + coordinate.join(', ') + ']');
    }
}

function assertNotEmpty(obj) {
    if (obj === undefined || obj === null) {
        throw new TypeError('Empty value passed to GeoCoordinate constructor: '+obj);
    }
}

function parseCoordinateObject(coordinate) {
    const latitude = coordinate.latitude;
    const longitude = coordinate.longitude;
    const altitude = (+coordinate.altitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        const ret = [latitude, longitude];
        if (Number.isFinite(altitude)) {
            ret.push(altitude);
        }
        return ret;
    }
    const err = new TypeError('Invalid coordinate object passed to GeoCoordinate constructor');
    err.coordinate = coordinate;
    throw err;
}

function isCoordinateObject(coordinate) {
    return coordinate.hasOwnProperty('latitude') && coordinate.hasOwnProperty('longitude');
}


/**
 * Returns [latitude, longitude, altitude]
 * @returns {number[]}
 */

GeoCoordinate.prototype.asArray = function () {
    // Return copy of an array - no one should mess with our internals
    return this._coordinate.slice();
};


/**
 * This method modifies array in-place
 * @param {coordinate[]} arr
 * @returns {coordinate[]} Sorted arr
 */

GeoCoordinate.prototype.sortArrayByReferencePoint = function (arr) {
    const that = this;
    arr.sort(function (a, b) {
        const aGeo = new GeoCoordinate(a);
        const bGeo = new GeoCoordinate(b);
        return that.quickDistanceTo(aGeo) - that.quickDistanceTo(bGeo);
    });
    return arr;
};

/**
 * Calculates a distance between two points, assuming they are on a plain area, correcting by actual latitude distortion.
 * Will produce bad results for long distances (>>500km) and points very close to the poles.
 */
GeoCoordinate.prototype.quickDistanceTo = function (coordinate) {
    const dLon = Math.abs((coordinate.longitude() - this.longitude()));
    const dLat = Math.abs((coordinate.latitude() - this.latitude()));
    const avgLat = (coordinate.latitude() + this.latitude()) / 2;
    const x = dLon * Math.cos(avgLat * D2R);
    return Math.sqrt(x * x + dLat * dLat) * mPerDegree;
};

GeoCoordinate.prototype.preciseDistanceTo = function (coordinate) {
    const longitudeDelta = Math.abs((coordinate.longitude() - this.longitude())) * D2R;
    const latitudeDelta = Math.abs((coordinate.latitude() - this.latitude())) * D2R;
    const a = Math.pow(Math.sin(latitudeDelta / 2), 2) + Math.cos(this.latitude() * D2R) * Math.cos(coordinate.latitude() * D2R) * Math.pow(Math.sin(longitudeDelta / 2), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Returns the distance in meters between this coordinate and the given one.
 * @param {coordinate} coordinate
 * @param {boolean} [precise=false] If set to true it will always calculate precise distance
 */

GeoCoordinate.prototype.distanceTo = function (coordinate, precise) {
    if (!(coordinate instanceof GeoCoordinate)) {
        return this.distanceTo(new GeoCoordinate(coordinate), precise);
    }
    const longitudeDelta = Math.abs((coordinate.longitude() - this.longitude()));
    const latitudeDelta = Math.abs((coordinate.latitude() - this.latitude()));
    // check if points are close enough to ingnore error from fast calculation
    if (precise || latitudeDelta > minDegreeDeviation || longitudeDelta > minDegreeDeviation) {
        return this.preciseDistanceTo(coordinate);
    } else {
        return this.quickDistanceTo(coordinate);
    }
};


/**
 * Calculates a distance between two points, assuming they are on a plain area, correcting by actual latitude distortion.
 * Will produce bad results for long distances (>>500km) and points very close to the poles.
 * @param {coordinate} coordinate
 * @returns {number}
 */
GeoCoordinate.prototype.distance3DTo = function (coordinate) {
    if (!(coordinate instanceof GeoCoordinate)) {
        return this.distance3DTo(new GeoCoordinate(coordinate));
    }
    const dLon = Math.abs((coordinate.longitude() - this.longitude())) * mPerDegree;
    const dLat = Math.abs((coordinate.latitude() - this.latitude())) * mPerDegree;
    const dAlt = Math.abs((coordinate.altitude() - this.altitude()));
    const avgLat = (coordinate.latitude() + this.latitude()) / 2;
    const x = dLon * Math.cos(avgLat * D2R);
    return Math.sqrt(x * x + dLat * dLat + dAlt * dAlt);

};
/** Calculates the coordinate that is a given number of meters from this coordinate at the given angle
 *  @param {number} distance the distance in meters the new coordinate is way from this coordinate.
 *  @param {number} bearing the angle at which the new point will be from the old point. In radians, clockwise from north.
 *  @returns {GeoCoordinate} a new instance of this class with only the latitude and longitude set. */
GeoCoordinate.prototype.pointAtDistance = function (distance, bearing) {
    const latitudeRadians = this.latitude() * D2R;
    const longitudeRadians = this.longitude() * D2R;
    const lat2 = Math.asin(Math.sin(latitudeRadians) * Math.cos(distance / R) +
        Math.cos(latitudeRadians) * Math.sin(distance / R) * Math.cos(bearing));
    const lon2 = longitudeRadians + Math.atan2(Math.sin(bearing) * Math.sin(distance / R) * Math.cos(latitudeRadians),
            Math.cos(distance / R) - Math.sin(latitudeRadians) * Math.sin(lat2));
    return new GeoCoordinate([lat2 / D2R, lon2 / D2R]);
};
/**
 * calculates the bearing from this point to a given Geocoordinate
 * @param {coordinate} coordinate
 * @return {number} bearing from 0 to 2Pi in radiant
 */
GeoCoordinate.prototype.bearingRadTo = function (coordinate) {
    if (!(coordinate instanceof GeoCoordinate)) {
        return this.bearingRadTo(new GeoCoordinate(coordinate));
    }
    const dLong = (coordinate.longitude() - this.longitude()) * D2R;
    const lat1 = this.latitude() * D2R;
    const lat2 = coordinate.latitude() * D2R;
    const y = Math.sin(dLong) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLong);
    const bearing = Math.atan2(y, x);
    return bearing < 0 ? 2 * Math.PI + bearing : bearing;
};
/**
 * calculates the bearing from this point to a given Geocoordinate
 * @param {coordinate} coordinate
 * @return {number} bearing from 0° to 359,99999°
 */
GeoCoordinate.prototype.bearingTo = function (coordinate) {
    return (this.bearingRadTo(coordinate) / D2R);
};

/**
/**
 * @returns {number} latitude
 */

GeoCoordinate.prototype.latitude = function () {
    return this._coordinate[0];
};

/**
 * @returns {number} longitude
 */
GeoCoordinate.prototype.longitude = function () {
    return this._coordinate[1];
};

/**
 * @returns {number} optional altitude or 0 if not available!
 * */
GeoCoordinate.prototype.altitude = function () {
    return this._coordinate[2] || 0;
};

module.exports = GeoCoordinate;