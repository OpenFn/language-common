import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import istanbul from 'rollup-plugin-istanbul';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

export default {
  entry: 'lib/index.js',
  plugins: [
    babel({
      // We explicitly set the babel presets here, due to the `modules` argument
      // is not supported by "stage-2". Remember to change .babelrc when adding
      // or changing plugins.
      presets: [ "stage-2", [ "es2015", { modules: false } ] ],
      babelrc: false,
      plugins: [ "external-helpers" ]
    })
  ],
  external: external,
  targets: [
    {
      dest: pkg['main'],
      format: 'umd',
      moduleName: 'languageCommon',
      sourceMap: true
    },
    {
      dest: pkg['jsnext:main'],
      format: 'es',
      sourceMap: true
    }
  ]
};
