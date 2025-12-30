export const success = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const fail = (res, error = {}, statusCode = 400) => {
  const message = error.message || "Request failed";
  const details = error.details || undefined;

  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
};
