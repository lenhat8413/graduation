export function ok(res, data, message = "Action completed", status = 200) {
  return res.status(status).json({
    success: true,
    data,
    message
  });
}

export function fail(res, message = "Something went wrong", status = 500, data = null) {
  return res.status(status).json({
    success: false,
    data,
    message
  });
}
