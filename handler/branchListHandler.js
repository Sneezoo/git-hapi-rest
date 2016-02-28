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
    .then(function (refs) {
      var refobjs = new Array();
      refs.forEach(function (ref, idx) {
        if(ref.isBranch())
          refobjs.push(ref);
      });
      return refobjs;
    }, function (err) {
      reject(new Error(err.message));
    })
    .then(function (refobjs) {
      resolve(refobjs);
    }, function (err) {
      reject(new Error(err.message));
    });
  });
  return promise;
};
