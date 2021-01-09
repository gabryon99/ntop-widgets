import { Config } from '@stencil/core';

// https://stackoverflow.com/questions/60633526/how-to-use-an-external-third-party-library-in-stencil-js

export const config: Config = {
  namespace: 'ntop-widgets',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      copy: [
        {
          src: 'js/d3.v3.js',
          dest: 'lib/d3.v3.js'
        },
        {
          src: 'js/nv.d3.js',
          dest: 'lib/nv.d3.js'
        }
      ],
      serviceWorker: null, // disable service workers
    },
  ],
};
