export const validate = (schema, property = "body") => (req, _res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
  if (error) return next(error);
  req[property] = value;
  next();
};
