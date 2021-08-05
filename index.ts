import fs from 'fs';
import { optimize } from 'svgo';
import cheerio from 'cheerio';

const CURR_DIR = process.cwd();

export async function convertSVGToSvelte() {
  // Get all svg's in current directory
  let svgs: Array<string> = [];
  try {
    svgs = await getSVGsInDir();
    console.log(svgs);
  } catch (error) {
    console.log(error);
  }

  svgs.forEach(async (svg) => {
    let optimisedSVG: string = await optimiseSvg(svg);
    let modifiedSVG = modifySVG(optimisedSVG);
    console.log(modifiedSVG);
  });
}

function getSVGsInDir(): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    let svgList: Array<string> = [];
    fs.readdir(CURR_DIR, (err, files) => {
      files.forEach((file) => {
        const extension = file.substring(file.lastIndexOf('.') + 1, file.length);
        if (extension === 'svg') {
          svgList.push(file);
        }
      });
      if (svgList.length > 0) {
        resolve(svgList);
      } else {
        reject("No SVG's in current directory");
      }
    });
  });
}

function optimiseSvg(svgPath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await fs.readFile(svgPath, 'utf-8', (err, data) => {
      const optimisedSvg = optimize(data);
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

type SVGParamsType = {
  fill: string | undefined;
  width: string | undefined;
  height: string | undefined;
};

type ModifiedSVGType = {
  currentParams: SVGParamsType;
  modifiedSVG: string;
};

function modifySVG(optimisedSVG: string): ModifiedSVGType {
  let currentParams: SVGParamsType = {
    fill: undefined,
    width: undefined,
    height: undefined
  };

  const $ = cheerio.load(optimisedSVG);
  currentParams.width = $('svg').attr('width');
  currentParams.height = $('svg').attr('height');

  $('svg').attr('width', '{width}');
  $('svg').attr('height', '{height}');
  $('svg').attr('class', '{$$props.class}');

  $('path')
    .toArray()
    .forEach((path) => {
      if (!currentParams.fill) currentParams.fill = path.attribs.fill;

      path.attribs.fill = '{fill}';
    });

  let editedHTML = $.html();
  editedHTML = replaceStringElements(editedHTML, SVG_REPLACEMENTS);

  return { currentParams: currentParams, modifiedSVG: editedHTML };
}

type ReplacementType = {
  old: string;
  new: string;
};

function replaceStringElements(string: string, replacements: Array<ReplacementType>): string {
  let tmpString = string;
  replacements.forEach((item: ReplacementType) => {
    tmpString = tmpString.replace(item.old, item.new);
  });
  return tmpString;
}

function generateSvelteComponent(svgString: string) {
  // Take svg and inject into Svelte component
}

convertSVGToSvelte();
