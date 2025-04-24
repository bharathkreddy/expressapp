# Express app with MVC artchitecture

![Architecture](./img/architeture.png)

# 🧪 CHANGE LOG from `e23133e` onwards

1. Commit **945c62e**: Basic Express app with routes setup
   1. Mongoose Model added.
   2. Routes Setup.
   3. Morgan middleware setup.
2. Commit : MVC architecture setup
   1. **22ac775** Routers setup.
      a. Move tour routes to a tourRouter in a seperate file - tourRouter.js
      b. There routes need routehandlers - so move them to tourRouter.js
      c. Route handlers need mongoose model and shema which need mongoose connection - so move all these to tourRouter.js
   2. **ec19e6b** Controller setup.
      a. Split out routerhandler functions in tourController.js
      b. controller functions need Tour object so spit out all of mongoose code from tourRouter.js to tourController.js
   3. Model setup.
      a. Split out all mongoose code i.e. schema and model and Tour model intantiation to tourModel.js
      b. import Tour object to be used by controller.
      c. Added a small helper script to run independently to import data from json and to delete all data from mongo. Here is how to use it.
      `node ./dev-data/data/import-data.js --delete`
      `node ./dev-data/data/import-data.js --import`
      The code parses the process.argv[2], the 0 arg is node , 1st is ./dev-data/data/import-data.js, we capture second after this to execute relavent function.
   4. server and app seperated.
