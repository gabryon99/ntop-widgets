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
      serviceWorker: null, // disable service workers
    },
  ],
};
