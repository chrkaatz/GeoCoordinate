/*jshint evil: false, bitwise:false, strict: false, undef: true, white: false, plusplus:false, node:true */


var GeoCoordinate = require("../lib/index.js").GeoCoordinate;
var testCase = require('nodeunit').testCase;

var P1 = new GeoCoordinate([0, 0, 0]); //Do you know where this is? ;)
var P2 = new GeoCoordinate([52.000000, 13.000000, 0]);

function equalDecimal(test, value, expected, delta, message) {
    var equal = Math.abs(value - expected) <= delta;
    test.ok(equal, message + ": actual value is not within epsilon |" + value + "-" + expected + "|>" + delta);
}
function degMinSecToDec(degree, minutes, seconds) {
    return degree +
        minutes/60 +
        seconds /3600;
}
var maxDelta = 0.0005;

// lat1, lon1, lat2, lon2, realDist 
var goldDist = [
    [52.500235, 13.274623, 52.500199, 13.274580, 5.0],
    [52.500235, 13.274623, 52.500090, 13.274449, 20.0],
    [52.500235, 13.274623, 52.499882, 13.274166, 50.0],
    [52.500235, 13.274623, 52.499516, 13.273739, 100.0],
    [52.386320, 13.357304, 52.385123, 13.357218, 133.77],
    [52.386320, 13.357304, 52.384076, 13.358157, 258.22],
    [52.502095, 13.276632, 52.498444, 13.272332, 500.1],
    [52.388053, 13.347313, 52.386320, 13.357304, 700.68],
    [52.388053, 13.347313, 52.384076, 13.358157, 856.66],
    [52.494973, 13.267656, 52.502095, 13.276632, 1000.00],
    [52.388053, 13.347313, 52.365767, 13.327428, 2822.54],
    [52.388053, 13.347313, 52.308504, 13.600255, 19332.97]
];
// get reference calculation from http://www.movable-type.co.uk/scripts/latlong.html
// 
module.exports = testCase({
    "test distance implementations": function(test){
        for (var i=0; i < goldDist.length; i++){
            var testData = goldDist[i];
            var p1 = new GeoCoordinate([testData[0], testData[1]]);
            var p2 = new GeoCoordinate([testData[2], testData[3]]);
            equalDecimal(test, p1.distanceTo(p2), testData[4], testData[4] * 0.015, "too big deviation (distanceTo)");
            equalDecimal(test, p1._quickDistanceTo(p2), testData[4], testData[4] * 0.015, "too big deviation (_quickDistanceTo)");
        }
        test.done();
    },
    "test get bearing north": function(test) {
        var north = new GeoCoordinate([3, 0, 0]);
        equalDecimal(test, P1.bearingTo(north), 0, 0, "north direction should be 0°");
        test.done();
    },
    "test get bearing northeast": function(test) {
        var northeast = new GeoCoordinate([3, 3, 0]);
        equalDecimal(test, P1.bearingTo(northeast), degMinSecToDec(44,57,39), maxDelta, "northeast not correctly calculated");
        test.done();
    },
    "test get bearing east": function(test) {
        var east = new GeoCoordinate([0, 120, 0]);
        equalDecimal(test, P1.bearingTo(east), degMinSecToDec(90,0,0), 0, "east not correctly calculated");
        test.done();
    },
    "test get bearing southeast": function(test) {
        var southeast = new GeoCoordinate([-10, 10, 0]);
        equalDecimal(test, P1.bearingTo(southeast), degMinSecToDec(135,26,19), maxDelta, "southeast not correctly calculated");
        test.done();
    },
    "test get bearing southwest": function(test) {
        var southwest = new GeoCoordinate([-45, -13, 0]);
        equalDecimal(test, P1.bearingTo(southwest), degMinSecToDec(192,40,40), maxDelta, "southwest not correctly calculated");
        test.strictEqual(P1.bearingRadTo(southwest), 3.3628605082691405, "rad north should be calculated too");
        test.done();
    },
    "test get bearing almost north": function(test) {
        var north = new GeoCoordinate([80, -0.2, 0]);
        equalDecimal(test, P1.bearingTo(north), degMinSecToDec(359,57,53), maxDelta, "almost north not correctly calculated");
        test.strictEqual(P1.bearingRadTo(north), 6.282569811232558, "rad north should be calculated too");
        test.done();
    },    
    "test get bearing almost north 2": function(test) {
        var north = new GeoCoordinate([52.50, 13.00, 0]);
        equalDecimal(test, P2.bearingTo(north), degMinSecToDec(0,0,0), maxDelta, "almost north not correctly calculated");
        test.strictEqual(P2.bearingRadTo(north), 0, "rad north should be calculated too");
        test.done();
    },
    "test get bearing northern hemisphers": function(test) {
        var bagdad = new GeoCoordinate([35,45,120]);
        var osaka = new GeoCoordinate([35,135,200]); 
        equalDecimal(test, bagdad.bearingTo(osaka), degMinSecToDec(60,9,45), maxDelta, "bagdad osaka not correctly calculated");
        test.done();
    }
});
