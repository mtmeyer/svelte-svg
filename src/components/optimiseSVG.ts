import fs from 'fs';
import { extendDefaultPlugins, optimize } from 'svgo';

export function optimiseSvg(svgPath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await fs.readFile(svgPath, 'utf-8', (err, data) => {
      if (err) reject(err);

      const options = {
        plugins: extendDefaultPlugins([
          {
            name: 'removeViewBox',
            active: false
          }
        ])
      };

      const optimisedSvg = optimize(data, options);
      resolve(optimisedSvg.data);
    });
  });
}
