const { param, body } = "express-validator";

const mongoDbReqParamValidator = (mongoId) => {
  return [
    param(mongoId).notEmpty().isMongoId().withMessage("Invalid mongoDb id"),
  ];
};

const mongoDbReqBodyValidator = () => {
  return [
    body(mongoId).notEmpty().isMongoId().withMessage("Invalid mongoDb id"),
  ];
};

export { mongoDbReqBodyValidator, mongoDbReqParamValidator };
