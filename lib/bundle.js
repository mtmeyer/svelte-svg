'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var svgo = require('svgo');
var cheerio = require('cheerio');
var templateFile = require('template-file');
var prettier = require('prettier');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var cheerio__default = /*#__PURE__*/_interopDefaultLegacy(cheerio);
var prettier__default = /*#__PURE__*/_interopDefaultLegacy(prettier);

const CURR_DIR = process.cwd();
async function convertSVGToSvelte() {
    // Get all svg's in current directory
    let svgs = [];
    try {
        svgs = await getSVGsInDir();
    }
    catch (error) {
        console.log(error);
    }
    if (svgs.length > 0) {
        await fs__default['default'].mkdir(path__default['default'].join(CURR_DIR, 'output'), (err) => {
            if (err)
                console.error(err);
        });
        svgs.forEach(async (svg) => {
            let optimisedSVG = await optimiseSvg(svg);
            let modifiedSVG = modifySVG(optimisedSVG);
            const fileName = svg.replace('.svg', '.svelte');
            generateSvelteComponent(modifiedSVG, fileName);
        });
    }
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
            if (err)
                reject(err);
            const options = {
                plugins: svgo.extendDefaultPlugins([
                    {
                        name: 'removeViewBox',
                        active: false
                    }
                ])
            };
            const optimisedSvg = svgo.optimize(data, options);
            resolve(optimisedSvg.data);
        });
    });
}
const SVG_REPLACEMENTS = [
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
    const editedHTML = replaceStringElements($.html(), SVG_REPLACEMENTS);
    const prettierOptions = {
        singleQuote: true,
        parser: 'html'
    };
    const formattedHTML = prettier__default['default'].format(editedHTML, prettierOptions);
    return { currentParams: currentParams, modifiedSVG: formattedHTML };
}
function replaceStringElements(string, replacements) {
    let tmpString = string;
    replacements.forEach((item) => {
        tmpString = tmpString.replace(new RegExp(item.old, 'g'), item.new);
    });
    return tmpString;
}
async function generateSvelteComponent(modifiedSVG, fileName) {
    const template = path__default['default'].join(__dirname, 'iconTemplate.svelte');
    const componentData = {
        svgFile: modifiedSVG.modifiedSVG,
        currentValues: modifiedSVG.currentParams
    };
    templateFile.renderFile(template, componentData).then((component) => {
        fs__default['default'].writeFile(path__default['default'].join(CURR_DIR, 'output', fileName), component, (err) => {
            if (err)
                throw err;
            console.log('The file has been saved!');
        });
    });
}

exports.convertSVGToSvelte = convertSVGToSvelte;
