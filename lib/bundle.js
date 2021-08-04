'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const CURR_DIR = process.cwd();
async function convertSVGToSvelte() {
    // Get all svg's in current directory
    try {
        const svgs = await getSVGsInDir();
        console.log(svgs);
    }
    catch (error) {
        console.log(error);
    }
    // Iterate over them
    //   Optimize with svgo
    //   Replace svg width/height with variable
    //   Pull out path tags
    //   Replace fill with variable
    //   Add class with {$$props.class}
}
function getSVGsInDir() {
    return new Promise((resolve, reject) => {
        let svgList = [];
        fs__default['default'].readdir(CURR_DIR, (err, files) => {
            files.forEach((file) => {
                const extension = file.substring(file.lastIndexOf('.') + 1, file.length);
                if (extension === 'svg') {
                    svgList.push(file);
                }
            });
            if (svgList.length > 0) {
                resolve(svgList);
            }
            else {
                reject("No SVG's in current directory");
            }
        });
    });
}
convertSVGToSvelte();

exports.convertSVGToSvelte = convertSVGToSvelte;
