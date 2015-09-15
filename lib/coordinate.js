var _ = require('lodash');

var D2R = (Math.PI / 180.0);
/** earth radius in m */
var R = 6376500;
var mPerDegree = 2 * Math.PI * R / 360;
var minDegreeDeviation = 6;

/**
 * @param coordinate {array} [latitude, longitude(, altitude)]
 *                        OR
 *                   {object} {latitude: 0, longitude: 1(, altitude: 25)}
 */
function GeoCoordinate(coordinate) {
    if(!(this instanceof GeoCoordinate)) {
        return new GeoCoordinate(coordinate);
    }
    if(coordinate instanceof Array) {
        this.set(coordinate);
    } else if(coordinate.hasOwnProperty("latitude") && coordinate.hasOwnProperty("longitude")){
        this.set([
            coordinate.latitude,
            coordinate.longitude, 
            coordinate.altitude || 0
        ]);
    } else if(arguments.length === 2 && typeof arguments[0] === "number" && typeof arguments[1] === "number") {
        this.set(arguments);
    }
}

/** Reassign the latitude and longitude this coordinate is working with. */
GeoCoordinate.prototype = {
    set: function(coordinate) {
        this.coordinate = coordinate;
    },
    get: function() {
        return this.coordinate;
    },
    isSet: function() {
        return _.isArray(this.coordinate);
    },
    /**
    * sort an array by reference to a given point
    **/
    sortArrayByReferencePoint: function(arr) {
        var that = this;
        var aGeo, bGeo;
        arr.sort(function ( a, b ) {
            aGeo = new GeoCoordinate(a);
            bGeo = new GeoCoordinate(b);
            return that._quickDistanceTo( aGeo ) - that._quickDistanceTo( bGeo );
        });
        return arr;
    },
    /**
     * Calculates a distance between two points, assuming they are on a plain area, correcting by actual latitude distortion.
     * Will produce bad results for long distances (>>500km) and points very close to the poles.
     */
    _quickDistanceTo: function(coordinate) {
        var dLon = Math.abs((coordinate.longitude() - this.longitude()));
        var dLat = Math.abs((coordinate.latitude() - this.latitude()));
        var avgLat = (coordinate.latitude() + this.latitude()) / 2;
        var x = dLon * Math.cos(avgLat*D2R);
        return Math.sqrt(x*x+dLat*dLat) * mPerDegree;
    },
    /**
     * Returns the distance in meters between this coordinate and the given one.
     * @param {boolean} force if set to falsy value this will use @{link _quickDistanceTo}
     *                  if either delta for lon or lat is less than {@link minDegreeDeviation}
     */
    distanceTo: function(coordinate, force) {
        var dlong = Math.abs((coordinate.longitude() - this.longitude()));
        var dlat = Math.abs((coordinate.latitude() - this.latitude()));
        // check if points are close enough to ingnore error from fast calculation
        if (!force && (dlat < minDegreeDeviation || dlong < minDegreeDeviation)) {
            var avgLat = (coordinate.latitude() + this.latitude()) / 2;
            return this._quickDistanceTo(coordinate);
        }
        dlong = dlong * D2R;
        dlat = dlat * D2R;
        var a = Math.pow(Math.sin(dlat/2), 2) + Math.cos(this.latitude()*D2R) * Math.cos(coordinate.latitude()*D2R) * Math.pow(Math.sin(dlong/2), 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;

        return d;
    },
    /**
     * Calculates a distance between two points, assuming they are on a plain area, correcting by actual latitude distortion.
     * Will produce bad results for long distances (>>500km) and points very close to the poles.
     */
    distance3DTo: function(coordinate) {

        var dLon = Math.abs((coordinate.longitude() - this.longitude())) * mPerDegree;
        var dLat = Math.abs((coordinate.latitude() - this.latitude())) * mPerDegree;
        var dAlt = Math.abs((coordinate.altitude() - this.altitude()));
        var avgLat = (coordinate.latitude() + this.latitude()) / 2;
        var x = dLon * Math.cos(avgLat*D2R);
        return Math.sqrt(x*x+dLat*dLat+dAlt*dAlt);

    },
    /** Calculates the coordinate that is a given number of meters from this coordinate at the given angle
     *  @param {number} distance the distance in meters the new coordinate is way from this coordinate.
     *  @param {number} bearing the angle at which the new point will be from the old point. In radians, clockwise from north.
     *  @returns {coordinate} a new instance of this class with only the latitude and longitude set. */
    pointAtDistance: function(distance, bearing) {
        var latitudeRadians = this.latitude() * D2R;
        var longitudeRadians = this.longitude() * D2R;

        var R = 6371000; // meter
        var lat2 = Math.asin( Math.sin(latitudeRadians)*Math.cos(distance/R) +
                              Math.cos(latitudeRadians)*Math.sin(distance/R)*Math.cos(bearing) );
        var lon2 = longitudeRadians + Math.atan2(Math.sin(bearing)*Math.sin(distance/R)*Math.cos(latitudeRadians),
                                     Math.cos(distance/R)-Math.sin(latitudeRadians)*Math.sin(lat2));
        return new GeoCoordinate([lat2 / D2R, lon2 / D2R]);
    },
    /**
     * calculates the bearing from this point to a given Geocoordinate
     * @return bearing from 0 to 2Pi in radiant
     */
    bearingRadTo: function(coordinate) {
        var dLong = (coordinate.longitude() - this.longitude()) * D2R;
        var lat1 = this.latitude() * D2R;
        var lat2 = coordinate.latitude() * D2R;
        var y = Math.sin(dLong) * Math.cos(lat2);
        var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLong);
        var bearing = Math.atan2(y, x);
        return bearing < 0 ? 2 * Math.PI + bearing : bearing;
    },
    /**
     * calculates the bearing from this point to a given Geocoordinate
     * @return bearing from 0° to 359,99999°
     */
    bearingTo: function(coordinate) {
        return (this.bearingRadTo(coordinate) / D2R);

    },

    latitude: function() {
        return this.coordinate[0];
    },

    longitude: function() {
        return this.coordinate[1];
    },

    /**
     * @returns optional altitude or 0 if not available!
     * */
    altitude: function() {
        return this.coordinate[2] || 0;
    }
};

module.exports = GeoCoordinate;