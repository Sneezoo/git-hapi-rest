const Git = require("nodegit"),
      Promise = require("promise");

module.exports = function (target) {
  var promise = new Promise(function (resolve, reject) {
    Git.Repository.open(target)
    .then(function (repo) {
      return repo.getReferences(Git.Reference.TYPE.LISTALL);
    }, function (err) {
      reject(new Error(err.message));
    })
    .then(function (ref) {
      var tags = [];
      ref.forEach(function (el) {
        if(el.isTag())
          tags.push(el);
      });
      resolve(tags);
    });
  });
  return promise;
};
