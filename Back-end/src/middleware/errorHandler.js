const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "البيانات موجودة مسبقا",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "البيانات غير موجودة",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "حدث خطأ في الخادم",
  });
};

module.exports = errorHandler;
