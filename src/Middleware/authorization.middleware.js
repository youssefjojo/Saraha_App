




export const authorizationMiddleware = (roles) => {
    return (req, res, next) => {
        const {user:{role}} = req
        console.log({"role" : role});
      if (roles.includes(role)) {
          return next();
      }
      return res.status(403).json({ message: "Unauthorized" });
    };
  };