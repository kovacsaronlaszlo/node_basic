/**
 * védjük az URL-ket a jogosulatlan megnyitás ellen
 */
module.exports = (req, res, next) => {
  if (!res.locals.authenticated) {
      res.redirect('/');
  } else {
      next();
  }
};