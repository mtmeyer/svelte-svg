export type ReplacementType = {
  old: string;
  new: string;
};
export type SVGParamsType = {
  fill: string | undefined;
  width: string | undefined;
  height: string | undefined;
};

export type ModifiedSVGType = {
  currentParams: SVGParamsType;
  modifiedSVG: string;
};
