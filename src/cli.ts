import fs from 'fs';
import path from 'path';

import { Data, renderFile } from 'template-file';

import { optimiseSvg } from './components/optimiseSVG';
import { modifySVG } from './components/modifySVG';
import { ModifiedSVGType } from './typings/SVGTypes';

const CURR_DIR = process.cwd();

export async function convertSVGToSvelte() {
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
      generateSvelteComponent(modifiedSVG, fileName);
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

async function generateSvelteComponent(modifiedSVG: ModifiedSVGType, fileName: string) {
  const template = path.join(__dirname, 'iconTemplate.svelte');
  const componentData = {
    svgFile: modifiedSVG.modifiedSVG,
    currentValues: modifiedSVG.currentParams
  };

  renderFile(template, componentData as Data).then((component) => {
    fs.writeFile(path.join(CURR_DIR, 'output', fileName), component, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  });
}
