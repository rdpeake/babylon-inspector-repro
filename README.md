# babylon-inspector-repro

This is a simple test to demonstrate trying to import the inspector in a worker thread (not show it) results in an error.

`npm run start` will run the project, which in the default configuration will cause an error.

if you comment out https://github.com/rdpeake/babylon-inspector-repro/blob/master/src/SceneLoader.ts#L4 the project will run in an offscreen canvas

if you however leave the above line uncommented, and instead uncomment the first line in https://github.com/rdpeake/babylon-inspector-repro/blob/master/index-dev.js and comment the second one, the project will run, and this time load an inspector (as it is not running in an offscreen canvas.
