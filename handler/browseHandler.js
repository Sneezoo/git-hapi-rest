const Git = require("nodegit"),
      Promise = require("promise");

module.exports = function (target, repo_commit, repo_path) {
  var promise = new Promise(function (resolve, reject) {
    Git.Repository.open(target)
    .then(function (repo) {
      if (repo_commit) {
        return repo.getCommit(repo_commit).then(function (commit) {
          return commit;
        }, function (err) {
          return repo.getBranchCommit(repo_commit).then(function (commit) {
            return commit;
          }, function (err) {
            reject(new Error(err.message));
            return;
          });
        });
      } else {
        return repo.getHeadCommit();
      }
    }, function (err) {
      reject(new Error(err.message));
      return;
    })
    .then(function (commit) {
      return commit.getTree()
    }, function (err) {
      reject(new Error(err.message));
      return;
    })
    .then(function (tree) {
      if(repo_path)
        return tree.getEntry(repo_path);
      else
        return tree;
    }, function (err) {
      reject(new Error(err.message));
      return;
    })
    .then(function (entree) {
      if(entree.isDirectory && entree.isBlob) {
        if (entree.isTree())
          return entree.getTree();
        else
          return entree.getBlob();
      } else {
        return entree;
      }
    }, function (err) {
      reject(new Error(err.message));
      return;
    })
    .then(function (file) {
      if(file.content && file.filemode)
        resolve(file.content());
      else {
        var files = [],
            entries = file.entries();
        for (var i = 0; i < entries.length; i++) {
          files.push({
            "name": entries[i].filename(),
            "dir": entries[i].isDirectory(),
            "sha": entries[i].sha()
          });
        }
        resolve(files);
      }
      return;
    }, function (err) {
      reject(new Error(err.message));
      return;
    });
  });
  return promise;
};
