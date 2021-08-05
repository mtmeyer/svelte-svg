'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var svgo = require('svgo');
var cheerio = require('cheerio');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var cheerio__default = /*#__PURE__*/_interopDefaultLegacy(cheerio);

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
        let optimisedSVG = await optimiseSvg(svg);
        let modifiedSVG = modifySVG(optimisedSVG);
        console.log(modifiedSVG);
    });
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
const SVG_REPLACEMENTS = [
    { old: 'width="{width}"', new: 'width={width}' },
    { old: 'height="{height}"', new: 'height={height}' },
    { old: 'class="{$$props.class}"', new: 'class={$$props.class}' },
    { old: 'fill="{fill}"', new: 'fill={fill}' },
    { old: '<html>', new: '' },
    { old: '</html>', new: '' },
    { old: '<head></head>', new: '' },
    { old: '<body>', new: '' },
    { old: '</body>', new: '' }
];
function modifySVG(optimisedSVG) {
    let currentParams = {
        fill: undefined,
        width: undefined,
        height: undefined
    };
    const $ = cheerio__default['default'].load(optimisedSVG);
    currentParams.width = $('svg').attr('width');
    currentParams.height = $('svg').attr('height');
    $('svg').attr('width', '{width}');
    $('svg').attr('height', '{height}');
    $('svg').attr('class', '{$$props.class}');
    $('path')
        .toArray()
        .forEach((path) => {
        if (!currentParams.fill)
            currentParams.fill = path.attribs.fill;
        path.attribs.fill = '{fill}';
    });
    let editedHTML = $.html();
    editedHTML = replaceStringElements(editedHTML, SVG_REPLACEMENTS);
    return { currentParams: currentParams, modifiedSVG: editedHTML };
}
function replaceStringElements(string, replacements) {
    let tmpString = string;
    replacements.forEach((item) => {
        tmpString = tmpString.replace(item.old, item.new);
    });
    return tmpString;
}
convertSVGToSvelte();

exports.convertSVGToSvelte = convertSVGToSvelte;
