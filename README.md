# Express app with MVC artchitecture

![Architecture](./img/architeture.png)

# 🧪 CHANGE LOG from `e23133e` onwards

1. Commit **945c62e**: Basic Express app with routes setup
   1. Mongoose Model added.
   2. Routes Setup.
   3. Morgan middleware setup.
2. Commit : MVC architecture setup
   1. Routers setup.
      a. Move tour routes to a tourRouter in a seperate file - tourRouter.js
      b. There routes need routehandlers - so move them to tourRouter.js
      c. Route handlers need mongoose model and shema which need mongoose connection - so move all these to tourRouter.js
   2. Controller setup.
   3. Model setup.
   4. server and app seperated.
