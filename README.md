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
   3. **6fdedfb** Model setup.
      a. Split out all mongoose code i.e. schema and model and Tour model intantiation to tourModel.js
      b. import Tour object to be used by controller.
   4. **500c4d5** Added a small helper script to run independently to import data from json and to delete all data from mongo. Here is how to use it.
      `node ./dev-data/data/import-data.js --delete`

      `node ./dev-data/data/import-data.js --import`
      The code parses the process.argv[2], the 0 arg is node , 1st is ./dev-data/data/import-data.js, we capture second after this to execute relavent function.

3. server and app seperated.
4. Advance queryfiltering.
   1. Capture `req.query` to get all query params
      Issues faced:
      - Mongoexpected query format simple filter `{difficulty:"easy", duration: 5}`. Here req.query capures exactly the same if API query is `/api/v1/tours?difficulty=easy&duration=5`. However first we need to seperate out some special params out of the request body.
   2. **4bb6aa1** Filter out special params out of it : `page, sort, limit, flelds` as these mean some special things. Now request like `/api/v1/tours?difficulty=easy&duration=5&limit=5` would be handled properly by removing `limit=5`from requrest query.
   3. **f000276** Advance filtering to allow operators like `>=` , `>`, `<=`, and `>`. Mongoose query would look like `{difficulty:"easy", duration: {$gte: 5}}` and api looks like `/api/v1/tours?difficulty=easy&duration[gte]=5`. For this conversion we need to use a library called `qs` on npm see the documentation to see it converts query strings to deeply nested objects. we need to do `app.set("query parser", (str) => qs.parse(str));` while app.get _mounts_ a middleware, app.set is used to configure Express settings. Here we are setting express' req.query parser to qs which then converts the req.query objects to deeply nested objects.
   4. **4ca1d11** Sorting - To implement this first we need to
      a. remove await from `let tours = await Tour.find(mongoQuery);`. Await causes tours to be immediately populated by an array of documents. but without Await the result of any .find is a `query` object. These objects are chainable. For sort we need to chain the .find result with .sort. Hence we need to build a query first and then execute the query.
      b. Then check if req.query has sort field and if yes chain the query with sort method with sort parameter, before calling the entire chain.
      c. For descending order use `/api/v1/tours?difficulty=easy&duration[gte]=5&sort=-price`. Notice the `-` in front of sort field.
      d. Sorting ties use this `api/v1/tours?sort=duration,-price` so we need to replace `,` by a `space`.
   5. **ed50193** Projections - limitiing fields to expose. we use this `/api/v1/tours?sort=duration,-price&fields=name,difficulty,price,summary` and replace `,` the same way as above.
   6. Pagination - we use `/api/v1/tours?page=2&limit=4` show me page 2 and limit each page to 4 results.
