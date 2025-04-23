# Express app with MVC artchitecture

![Architecture](./img/architeture.png)

# 🧪 CHANGE LOG

1. Commit: Mongoose
   1. Mongoose Model added
   2. tour controller changed to remove all fs reads and now controller interacts with model.
   3. Deleted - Id & body checks no longer, Mongoose natively implements it. This means router.param is also removed from tourRouter.
