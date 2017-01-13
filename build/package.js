export var name = "d3-tooltip";
export var version = "1.0.0";
export var description = "Pure SVG tooltip in d3";
export var main = "index.js";
export var directories = {"test":"test"};
export var scripts = {"pretest":"script/pretest","test":"script/test","prepublish":"script/prepublish","start":"script/start","dev":"NODE_ENV=dev && script/prepublish --watch","reload":"livereload 'example/build/'","watch":"npm-run-all --parallel reload dev"};
export var repository = {"type":"git","url":"git+https://github.com/akash-goswami/d3-tooltip.git"};
export var author = "";
export var license = "MIT";
export var bugs = {"url":"https://github.com/akash-goswami/d3-tooltip/issues"};
export var homepage = "https://github.com/akash-goswami/d3-tooltip#readme";
export var dependencies = {"d3-selection":"^1.0.3","fusioncharts-smartlabel":"^1.0.2"};
export var devDependencies = {"babel-eslint":"^7.1.1","eslint":"^3.12.2","json2module":"0.0","http-server":"^0.9.0","package-preamble":"0.0","rimraf":"2","rollup":"0.36","rollup-plugin-ascii":"0.0","rollup-plugin-commonjs":"^7.0.0","rollup-plugin-node-resolve":"2","rollup-watch":"^3.1.0","tape":"4","uglify-js":"2","uglifyjs":"^2.4.10","livereload":"^0.6.0","npm-run-all":"^4.0.0","rollup-plugin-replace":"^1.1.1"};
