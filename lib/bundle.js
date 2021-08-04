'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var svgo = require('svgo');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const CURR_DIR = process.cwd();
async function convertSVGToSvelte() {
    // Get all svg's in current directory
    let svgs = [];
    try {
        svgs = await getSVGsInDir();
        console.log(svgs);
    }
    catch (error) {
        console.log(error);
    }
    svgs.forEach(async (svg) => {
        console.log(await optimiseSvg(svg));
    });
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
function optimiseSvg(svgPath) {
    return new Promise(async (resolve, reject) => {
        await fs__default['default'].readFile(svgPath, 'utf-8', (err, data) => {
            const optimisedSvg = svgo.optimize(data);
            resolve(optimisedSvg.data);
        });
    });
}
convertSVGToSvelte();

exports.convertSVGToSvelte = convertSVGToSvelte;
