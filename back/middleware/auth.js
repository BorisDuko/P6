const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "SECRET_TOKEN_FOR_P6_PROJECT");
    const userId = decodedToken.userId;
    // to make sure user is who he really is: req.userId = userId;
    // req.auth = { userId: userId} same thing as:
    // !important - without this line ⤵ sauce.js auth routes doesn't works
    // req.auth = { userId };
    if (req.body.userId && req.body.userId !== userId) {
      throw "Invalid user ID";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};
