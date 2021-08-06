import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import cheerio from 'cheerio';
import { renderFile } from 'template-file';
import prettier from 'prettier';

const CURR_DIR = process.cwd();

export async function convertSVGToSvelte() {
  // Get all svg's in current directory
  let svgs: Array<string> = [];
  try {
    svgs = await getSVGsInDir();
  } catch (error) {
    console.log(error);
  }

  if (svgs.length > 0) {
    await fs.mkdir(path.join(CURR_DIR, 'output'), (err) => {
      if (err) console.error(err);
    });

    svgs.forEach(async (svg) => {
      let optimisedSVG: string = await optimiseSvg(svg);
      let modifiedSVG = modifySVG(optimisedSVG);
      const fileName = svg.replace('.svg', '.svelte');
      generateSvelteComponent(modifiedSVG.modifiedSVG, fileName);
    });
  }
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
  // { old: 'width="{width}"', new: 'width={width}' },
  // { old: 'height="{height}"', new: 'height={height}' },
  // { old: 'class="{$$props.class}"', new: 'class={$$props.class}' },
  // { old: 'fill="{fill}"', new: 'fill={fill}' },
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

  const editedHTML = replaceStringElements($.html(), SVG_REPLACEMENTS);

  const prettierOptions = {
    singleQuote: true,
    parser: 'html'
  };

  const formattedHTML = prettier.format(editedHTML, prettierOptions);

  return { currentParams: currentParams, modifiedSVG: formattedHTML };
}

type ReplacementType = {
  old: string;
  new: string;
};

function replaceStringElements(string: string, replacements: Array<ReplacementType>): string {
  let tmpString = string;
  replacements.forEach((item: ReplacementType) => {
    tmpString = tmpString.replace(new RegExp(item.old, 'g'), item.new);
  });
  return tmpString;
}

async function generateSvelteComponent(svgString: string, fileName: string) {
  // Take svg and inject into Svelte component
  renderFile('./iconTemplate.svelte', { svgFile: svgString }).then((component) => {
    fs.writeFile(path.join(CURR_DIR, 'output', fileName), component, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  });
}

convertSVGToSvelte();
