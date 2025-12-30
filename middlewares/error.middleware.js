import { fail } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return fail(
    res,
    {
      message,
      details: err.details,
    },
    statusCode
  );
};
