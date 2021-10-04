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


          /**
           * check whether path.join(options.loc, loc) exists
           * if TRUE then process index.js inside it.
           * else try to get the JS file from the same name.
           * else skip this step
           */

          let locPath = path.join(options.loc, loc);

          var nestedTree = {};

          if(options.skipComponents.indexOf(node.tag) === -1) {

            if (fs.existsSync(locPath)) {
              contents = fs.readFileSync(path.join(options.loc, loc, "index.js"), 'utf8');
              nestedTree = posthtml([plugin({ loc: path.join(options.loc, loc), skipComponents: options.skipComponents })])
              .process(contents, { sync: true });
            } else {
              contents = fs.readFileSync(locPath + '.js', 'utf8');
              nestedTree = posthtml([plugin({ loc: options.loc, skipComponents: options.skipComponents })])
              .process(contents, { sync: true });
            }

            var newtree = traverser(nestedTree.tree);
            node = [];
            newtree.walk(function (n) {
                if(typeof n !== 'string')
                  node.push(n);
              });
            } else {
              if(node.attrs.code) {
                node.content = ['{' + node.tag + '.' + node.attrs.code + '}'];
              }
              // else {
              //   node.content = ['Component Replaced: ' + node.tag];
              // }
              node.attrs = {};
              // eat the component which cannot be parsed for now.
              node.tag = 'div';
            }

          }  
            
        return node;
      }
      //text node
      if(node && node.replace) {
        return node.replace('{', '${');
      } else {
        return node;
      }
      
    });
    return tree;
  };
  return traverser;
};
module.exports = plugin;