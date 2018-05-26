/**
 * @author: Apurav Chauhan (apurav.chauhan@gmail.com)
 */
var path = require('path');
var fs = require("fs");
var posthtml = require('posthtml');

var plugin = function posthtmlCustomElements(options) {
  options = options || {};
  var traverser = function (tree) {
    tree.walk(function (node) {
      if (node.tag) {
        var tag = node.tag;
        var attrs = node.attrs || [];
        if (tag === 'PLUGIN-LOOP') {
          node.tag = '#list';
          if (attrs.data && attrs.type) {
            attrs[attrs.data] = true;
            attrs.as = true;
            attrs[attrs.type] = true;
            delete attrs.data;
            delete attrs.type;
          }
        }
        if (tag === 'PLUGIN-CONDITION') {
          node.tag = '#if';
          if (attrs.data && attrs.type) {
            var negate = attrs.type === '&&' ? '' : '!';
            attrs[negate + attrs.data] = true;
            delete attrs.data;
            delete attrs.type;
          }
        }
        for (var atr in attrs) {
          var value = attrs[atr];
          if (typeof value === 'string') {
            attrs[atr] = value.replace('{', '${');
          }
        }
        //fetch the actual HTML template from component's location
        if (attrs && attrs['cust-loc']) {
          var loc = attrs['cust-loc'];
          var contents = fs.readFileSync(path.join(options.loc, loc, "index.js"), 'utf8');
          var nestedTree = posthtml([plugin({ loc: path.join(options.loc, loc) })])
            .process(contents, { sync: true });
          var newtree = traverser(nestedTree.tree);
          node = [];
          newtree.walk(function (n) {
            node.push(n);
          });
        }
        return node;
      }
      //text node
      return node.replace('{', '${');
    });
    return tree;
  };
  return traverser;
};
module.exports = plugin;