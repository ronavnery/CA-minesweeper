'use strict';

// Gets a position by an element
function getElCoords(el) {
    el = el.className;
    var parts = el.split('-')
    var pos = { i: +parts[1], j: +parts[2] };
    return pos;
}

// Random Int func for placement of mines
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function blinkEl(el) {
    var elCurrentContent = el.innerHTML;
    el.innerHTML = '';
    setTimeout(function() {
        el.innerHTML= elCurrentContent;
    }, 500)
}

function runBlinkEl(el, times) {
    var interval = setInterval(blinkEl, 1000, el)
    setTimeout(function () {clearInterval(interval)}, times * 1000)
}
