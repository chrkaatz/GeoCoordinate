'use strict';

const CHUNK_SIZE = 10*1000;

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const jsonData = require('./data.json');
const chunkedArray = _.chunk(jsonData, CHUNK_SIZE);
const Coordinate = require('..').GeoCoordinate;
const startTime = process.hrtime();

let i = 0;
(function go() {
    const data = chunkedArray.pop();
    const results = [];
    if (data) {
        data.reduce(function benchmarkFunction(a, _b) {
            const b = new Coordinate(_b);
            results.push(a.distanceTo(b));
            results.push(b.distanceTo(a));
            results.push(b.latitude());
            results.push(b.longitude());
            results.push(b.altitude());
            return b;
        }, new Coordinate(0,0));
        setTimeout(go,0);
    } else {
        end();
    }
}());

function end() {
    const diff = process.hrtime(startTime);
    const nanoseconds = diff[0] * 1e9 + diff[1];
    console.log('Time per item: '+nanosecondsToReadable(nanoseconds/jsonData.length));
    console.log('Operations per second: '+operationsPerSeconds(nanoseconds, jsonData.length))
}

function nanosecondsToReadable(nanoseconds) {
    if (nanoseconds < 1000) {
        return nanoseconds.toFixed(2)+'ns ('+(nanoseconds/1e6).toFixed(4) +'ms)';
    } else if (nanoseconds<1e6) {
        return (nanoseconds/1000).toFixed(2)+'µs ('+(nanoseconds/1e6).toFixed(4) +'ms)';
    } else {
        return nanoseconds/1e6 +'ms';
    }
}

function operationsPerSeconds(nanoseconds, operations) {
    const seconds = nanoseconds/1e9;
    let ops = Math.round(operations/seconds);
    if (ops > 1000) {
        ops = (ops/1000).toFixed(1)+'K';
    } else if (ops > 1e6) {
        ops = (ops/1000).toFixed(1)+'M';
    }
    return ops +' operations/second';
}