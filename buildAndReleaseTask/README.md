Dev environment setup:

> npm install -g npm@latest
> npm install -g typescript@latest --save-dev
> npm install -g tfx-cli

To install app packages

> npm install
> Convert TypecSript code into JavaScript
> tsc
> To build a distributable navigare to buildAndReleaseTask folder and execute in command line:
> npm run build
> Before compiling make sure that the version is incremented in vss-extension.json file.
> To compile the code navigare to root folder and execute in command line:
> tfx extension create --manifest-globs vss-extension.json
> To update all packages:
> npm update

To run tests:

> CD buildAndReleaseTask
> tsc
> mocha tests/\_suite.js
