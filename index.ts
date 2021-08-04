import fs from 'fs';
import { optimize } from 'svgo';

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
    console.log(await optimiseSvg(svg));
  });

  //   Replace svg width/height with variable
  //   Pull out path tags
  //   Replace fill with variable
  //   Add class with {$$props.class}
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

function optimiseSvg(svgPath: string) {
  return new Promise(async (resolve, reject) => {
    await fs.readFile(svgPath, 'utf-8', (err, data) => {
      const optimisedSvg = optimize(data);
      resolve(optimisedSvg.data);
    });
  });
}

convertSVGToSvelte();
