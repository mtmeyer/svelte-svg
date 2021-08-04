'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const CURR_DIR = process.cwd();

function convertSVGToSvelte() {
  console.log('Guava');
  // Get all svg's in current directory
  getSVGsInDir();
  // Iterate over them
  //   Optimize with svgo
  //   Replace svg width/height with variable
  //   Pull out path tags
  //   Replace fill with variable
  //   Add class with {$$props.class}
}

async function getSVGsInDir() {
  console.log(CURR_DIR);
  fs__default['default'].readdir(CURR_DIR, (err, files) => {
    files.forEach((file) => {
      console.log(file);
    });
  });
}

convertSVGToSvelte();

exports.convertSVGToSvelte = convertSVGToSvelte;
