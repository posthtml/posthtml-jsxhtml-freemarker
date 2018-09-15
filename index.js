/**
 * @author: Apurav Chauhan
 */
var path = require('path');
var fs = require("fs");
var posthtml = require('posthtml');
var events = ["oncopy", "oncut", "onpaste", "oncompositionend",
 "oncompositionstart", "oncompositionupdate", "onkeydown", "onkeypress",
  "onkeyup", "onfocus", "onblur", "onchange", "oninput", "oninvalid",
   "onsubmit", "onclick", "oncontextmenu", "ondoubleclick", "ondrag", 
   "ondragend", "ondragenter", "ondragexit", "ondragleave", "ondragover",
    "ondragstart", "ondrop", "onmousedown", "onmouseenter", "onmouseleave", 
    "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onpointerdown", 
    "onpointermove", "onpointerup", "onpointercancel", "ongotpointercapture", 
    "onlostpointercapture", "onpointerenter", "onpointerleave", "onpointerover",
     "onpointerout", "onselect", "ontouchcancel", "ontouchend", "ontouchmove", 
     "ontouchstart", "onscroll", "onwheel", "onabort", "oncanplay",
      "oncanplaythrough", "ondurationchange", "onemptied", "onencrypted", 
      "onended", "onerror", "onloadeddata", "onloadedmetadata", "onloadstart", 
      "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onseeked", 
      "onseeking", "onstalled", "onsuspend", "ontimeupdate", "onvolumechange", 
      "onwaiting", "onload", "onerror", "onanimationstart", "onanimationend", 
      "onanimationiteration", "ontransitionend", "ontoggle"];
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
          if (events.indexOf(atr.toLowerCase())===-1 && typeof value === 'string') {
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