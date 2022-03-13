module.exports = (func) => (req, res, next) => {
  Promise.resolve(func(res, req, next)).catch(next);
};
