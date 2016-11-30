'use strict';


const ITEMS = 200*1000;
const fs = require('fs');
const path = require('path');
let i = ITEMS;
const arr = [];
const packageInfo = require('../package.json');

// Produced file is 12MB big - we don't want to commit it to repository, so we use random number generator with known seed
const generator = require('random-seed').create(packageInfo.name+packageInfo.version);

while(i--) {
    arr.push(randomItem())
}


function random() {
    return generator.random();
}

function randomItem() {
    return random() > 0.5 ? randomPositionArray() : randomPositionObject();
}

function randomPositionArray() {
    if (random() > 0.9) {
        return [randPos(), randPos(), randAlt()];
    } else {
        return [randPos(), randPos()];
    }
}

function randPos() {
    return random()*360-180;
}

function randAlt() {
    return (random()*500) | 0;
}

function randomPositionObject() {
    if (random() > 0.9) {
        return {
            longitude: randPos(),
            latitude: randPos(),
            altitude: randAlt()
        };
    } else {
        return {
            longitude: randPos(),
            latitude: randPos()
        };
    }
}

fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(arr, null, 1), 'utf8');