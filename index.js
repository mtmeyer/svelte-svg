import fs from 'fs';

const CURR_DIR = process.cwd();

export function convertSVGToSvelte() {
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
  fs.readdir(CURR_DIR, (err, files) => {
    files.forEach((file) => {
      console.log(file);
    });
  });
}

convertSVGToSvelte();
