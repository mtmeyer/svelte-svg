import cheerio from 'cheerio';
import prettier from 'prettier';

import { ModifiedSVGType, ReplacementType, SVGParamsType } from '../typings/SVGTypes';

const SVG_REPLACEMENTS: Array<ReplacementType> = [
  { old: '<html>', new: '' },
  { old: '</html>', new: '' },
  { old: '<head></head>', new: '' },
  { old: '<body>', new: '' },
  { old: '</body>', new: '' }
];

export function modifySVG(optimisedSVG: string): ModifiedSVGType {
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

function replaceStringElements(string: string, replacements: Array<ReplacementType>): string {
  let tmpString = string;
  replacements.forEach((item: ReplacementType) => {
    tmpString = tmpString.replace(new RegExp(item.old, 'g'), item.new);
  });
  return tmpString;
}
