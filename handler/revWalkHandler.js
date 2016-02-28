const Git = require("nodegit"),
      Promise = require("promise");

module.exports = function (target, branch, count) {
  var repository;
  var promise = new Promise(function (resolve, reject) {
        Git.Repository.open(target)
        .then(function (repo) {
          repository = repo;
          return repo.getReference(branch)
          .then(function (ref) {
            return repo.getReferenceCommit(ref).then(function (cmt) {
              return cmt;
            }, function (err) {
              reject(new Error(err.message));
            })
          }, function (err) {
            return repo.getCommit(branch).then(function (cmt) {
              return cmt;
            }, function (err) {
              reject(new Error(err.message));
            });
          });
        }, function (err) {
          reject(new Error(err.message));
        })
        .then(function (cmt) {
          var commits=[],
              i=0;
          repository
          .createRevWalk()
          .walk(cmt.id(), function (err, commit) {
            if ((count && i >= count) ||
                (!err && !commit) ||
                (err && err.errno === Git.Error.CODE.ITEROVER)) {
              commits.sort(function (a,b) {
                return a.date().getTime()-b.date().getTime();
              });
              resolve(commits.reverse());
              return;
            }
            if (err)
              reject(new Error(err.message));
            else {
              commits.push(commit);
              i++;
            }
          });
        }, function (err) {
          reject(new Error(err.message));
        });
      });
  return promise;
};
