const path = require('path'),
      fs = require('fs'),
      Boom = require('boom'),
      Nodegit = require('nodegit'),
      _ = require('lodash/core'),
      path = require('path'),
      baseOpts={
        base: "./",
        path: "/",
        branchList: {
          enable: true,
          path: "/{repo}.git/branches",
          handler: function (request, reply) {
            var f      = require('handler/branchListHandler.js'),
                target = path.resolve(exports.base,request.query.repo);
            f(target).then(function (branches) {
              var o = {};
              _.forIn(branches, function (el) {
                o[el.name()] = {
                  "shortname": el.shorthand(),
                  "head":el.isHead()>0,
                  "remote":el.isRemote()>0,
                  "valid":el.isValid()
                };
              });
              reply(o);
            }, function (err) {
              reply(Boom.notFound(err.message));
            });
          }
        },
        browseRepo: {
          enable: true,
          path: "/{repo}.git/{ref}/{files*?}",
          handler: function (request, reply) {
            var f      = require('handler/browseHandler.js'),
                target = path.resolve(exports.base,request.query.repo),
                commit = request.query.ref,
                path   = request.query.files && request.query.files.length > 0 ? path.resolve.apply(path, files) : "";
                f(target, commit, path).then(function (file) {
                  reply(file);
                }, function (err) {
                  reply(Boom.notFound(err.message));
                });
          }
        },
        listRepos: {
          enable: true,
          path: "/",
          handler: function (request, reply) {
            var f = require('handler/listRepositoriesHandler.js');
            f(exports.base).then(function (repos) {
              reply(repos);
            }, function (err) {
              reply(Boom.notFound(err.message));
            })
          }
        },
        revWalk: {
          enable: true,
          path: "/{repo}.git/history/{ref?}",
          handler: function (request, reply) {
            var f      = require('handler/revWalkHandler.js'),
                target = path.resolve(exports.base,request.query.repo),
                ref    = request.query.ref ? request.query.ref : 'master',
                count  = request.params.count ? (request.params.count === 'all' ? null : request.params.count) : 20;
            f(target, ref, count).then(function (commits) {
              var c = [];
              _.forIn(commits, function (e) {
                var parents = [];
                _.forIn(e.parents(), function (oid) {
                  parents.push(oid.toStrS());
                });
                c.push({
                  "author": commit.author().toString(),
                  "committer": commit.committer().toString(),
                  "time": commit.time(),
                  "message": commit.message(),
                  "oid": commit.id().toStrS(),
                  "sha": commit.sha(),
                  "parents": parents
                });
              });
              reply(c);
            }, function (err) {
              reply(Boom.notFound(err.message));
            });
          }
        },
        tagList: {
          enable: true,
          path: "/{repo}.git/tags",
          handler: function (request, reply) {
            var f      = require('handler/tagListHandler.js'),
                target = path.resolve(exports.base,request.query.repo);
            f(target).then(function (tags) {
              var ts = [];
              _.forIn(tags,function (e) {
                ts.push({
                  "name": e.shorthand(),
                  "fullName": e.name(),
                  "head": e.isHead() > 0,
                  "valid": e.isValid()
                });
              });
              reply(ts);
            }, function (err) {
              reply(Boom.notFound(err.message));
            });
          }
        }
      };

exports.register = function (server, options, next) {
  fs.mkdir(options.base, function (err) {
    if (err || err.code != "EEXIST")
      next(err);
    exports.base = options.base;
    exports.connection = server.select(options.connection) ||
                         (options.connection) ||
                         server.select('git-rest') ||
                         server;

    _.defaultsDeep(options, baseOpts);

    _.forIn(
      _.pick(
        options,
        ["branchList", "browseRepo", "listRepos", "revWalk", "tagList"]
      ),
      function (value, key) {
        if(value.enable)
          exports.connection.route({
            method: 'get',
            path: path.resolve(options.path,value.path),
            handler: value.handler
          });
      }
    );

    next();
  })
};
