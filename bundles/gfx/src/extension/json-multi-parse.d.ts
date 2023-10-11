declare module "json-multi-parse" {
  function parse(data: string): Array<object> & { remainder: string };
  export = parse;
}
