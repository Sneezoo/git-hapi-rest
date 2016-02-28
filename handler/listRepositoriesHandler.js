const fs = require("fs"),
      Promise = require("promise");

module.exports = function (basedir) {
  var promise = new Promise(function (resolve, reject) {
    fs.readdir(basedir, function (err, files) {
      if (err)
        fs.mkdir(basedir, function (err) {
          if (err)
            reject(new Error(err.message));
          listRepositories();
        });
      var repos = new Array();
      for (var i = 0; i < files.length; i++)
        Repository.open(files[i]).then(function () {
          repos.push(files[i]);
          if(i >= files.length)
            resolve(repos);
        });
    });
  });
  return promise;
};
