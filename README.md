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
   6. **7fa58dd** Pagination - we use `/api/v1/tours?page=2&limit=4` show me page 2 and limit each page to 4 results.
   7. **9b0860d** Aliasing. Lets say we want to expose a simple easy to remember endpoint for top 5 cheapest tours ranked by rating. for this
      1. First add a route to tourRouter.js
      2. Create a middleware to Prefill all the query fields and use this middleware in the router to hit the controller getAllTours.
   8. **6601f03** Aggregates - create a new route, and add aggregate operation.
5. **eac90c2** Mongoose middleware : you must add all middleware and plugins `before` calling mongoose.model(). Calling pre() or post() after compiling a model does not work in Mongoose.
   1. Document pre-save hook.
      1. a pre-hook document middleware added, uses slugify package, creates a slug and adds it to the document on every save (`create()` fires `save()` hooks.). This requires we add the `slug` property to the schema.
      2. These type of Middleware are useful for atomizing model logic. Here are some other ideas:
         a. complex validation
         b. removing dependent documents (removing a user removes all their blogposts)
         c. asynchronous defaults
         d. asynchronous tasks that a certain action triggers
      3. `Post` middleware are executed after the hooked method and all of its pre middleware have completed.
      4. `This` keyword in all document middleware points the `document` i.e the document being updated.
   2. Query middleware.
      1. `This` keyword in all query middleware points the curret `Query object`.
      2. Add `pre-find` hook to trigger a function which filters out all secretTours and passes the result to next function which is getAllTours.
      3. NOTE: current implementation runs before any `find` but doesnt run on `findOne` or any other type of find. To make the middleware work on all of these simply replace `find` with a regular expression for all words starting with find : `/^find/`.
   3. Aggregation middleware.
      1. `This` keyword in all query middleware points the current `Aggregation object`.
      2. `this.pipeline()` moethod returns the aggregation pipeline.
      3. If want to remove all secret tours from aggregation - just push one more `match stage` to beginnning of the `this.pipeline()`
6. **9842d31** Validators
   1. move as much as possible to model (all business logic) and keep controller layers thin.
   2. used `validator` library to add custom validations in model.
7. Error Handling:
   1. Using `ndb` for debugging.
      1. install `npm i ndb --global` , ndb package globally.
      2. add a `"debug": "ndb server.js"` in scripts section in `package.json`.
      3. run `npm run debug`.
   2. **625666f** Adding a middleware to catch any unhandled route.
      1. Currently if we hit an unhandled route, express returns an html  
         ![WrongRoute](img/wrongRoute.png)
      2. Adding a middleware at the end of app.js. This middleware is reached only if none of above middlewares are hit. There is at least 1 middleware where responce is sent back terminating the req-res cycle. So if this middleware his hit that means - it must have been a route which is not handled.
   3. Global Error handling.
      1. add a global error handler middleware. This takes 4 params, if we put 4 params on any middleware - express will detect it as global error middleware.
      2. change wrongroute middleware to generate and error.
      3. **4e03cff** pass error to `next`. If anything is passed into next in any middleware, express will assume its an error and will bypass rest of middlware stack and pass this error to the global error handler.
      4. **1b60399** Refactor: Create an appError class in utils folder, we add `Error.captureStackTrace(this, this.constructor)` to preserve the error stack trace.
      5. Refactor - moved global error middleware to contollers section as errorController.js
