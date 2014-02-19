exports.index = function(req, res){
  res.render(req.params.pagename, { debug: process.env.DEBUG });
};