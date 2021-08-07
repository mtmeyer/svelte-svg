import fs from 'fs';
import path from 'path';
import { Data, renderFile } from 'template-file';
import chalk from 'chalk';

import { optimiseSvg } from './components/optimiseSVG';
import { modifySVG } from './components/modifySVG';
import { ModifiedSVGType } from './typings/SVGTypes';

const CURR_DIR = process.cwd();

export async function convertSVGToSvelte() {
  // Get svg's in current directory
  let svgs: Array<string> = [];
  try {
    svgs = await getSVGsInDir();
  } catch (error) {
    console.log(chalk.magenta(`--- No SVG's in the current directory ---`));
  }

  if (svgs.length > 0) {
    const outputDir = path.join(CURR_DIR, 'output');

    // Check if output directory already exists
    let doesDirAlreadyExist = false;
    await fs.readdir(outputDir, (err, dir) => {
      if (dir) doesDirAlreadyExist = true;
    });

    // If no output directory exists, create one
    if (!doesDirAlreadyExist) {
      await fs.mkdir(outputDir, (err) => {
        if (err) throw err;
      });
    }

    // Optimise and modify svg and inject into Svelte component template
    svgs.forEach(async (svg) => {
      let optimisedSVG: string = await optimiseSvg(svg);
      let modifiedSVG = modifySVG(optimisedSVG);
      const fileName = svg.replace('.svg', '.svelte');
      generateSvelteComponent(modifiedSVG, fileName);
    });

    console.log(chalk.green(`Successfully created`, chalk.bold(svgs.length), `Svelte components`));
  }
}

function getSVGsInDir(): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    let svgList: Array<string> = [];
    fs.readdir(CURR_DIR, (err, files) => {
      // Check if files are svg's and add to array if true
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
    });
  });
}
