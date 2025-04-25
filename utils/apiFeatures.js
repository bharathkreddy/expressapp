module.exports = class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; //we need to make a copy and not modify the original request.
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((SpecialWord) => delete queryObj[SpecialWord]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const mongoQuery = JSON.parse(queryStr);
    this.query = this.query.find(mongoQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  project() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); //excluding the __v which mongo creates for its internal use.
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //if no user page then default of 1 page - allways good to limit resuts and prevent an explosion.
    const limit = this.queryString.limit * 1 || 100; //multiply by 1 to convert strings to a number.
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};
