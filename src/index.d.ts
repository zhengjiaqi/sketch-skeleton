export declare interface SkeletonOptions {
  useLoading?: boolean
  useAdaptive?: boolean
  generateHtml?: boolean
  generateTemplate?: boolean
}
export declare function build(sketchFile: string, dest: string, options: SkeletonOptions): void;
export declare function getSketchString(sketchFile: string, options: SkeletonOptions): Promise<string>;
