/* jshint mocha: true, maxlen: false */
var posthtml = require('posthtml');
var custom = require('../index.js');
var expect = require('chai').expect;

function test(html, reference, options, done) {
  expect(posthtml([custom(options)])
    .process(html)
    .then(function (result) {
      expect(reference).to.eql(result.html);
      done();
    }).catch(function (error) {
      done(error);
    }));
}

describe('Normalized JSX HTML to Freemarker transpiler', function () {
  describe('Simple JSX', function () {
    it('Simple HTML', function (done) {
      var html = '<div>hello</div>';
      var reference = '<div>hello</div>';
      test(html, reference, { loc: __dirname }, done);
    });
    it('Simple Text', function (done) {
      var html = 'hello';
      var reference = 'hello';
      test(html, reference, { loc: __dirname }, done);
    });
    it('Simple JSX in Tag', function (done) {
      var html = '<div class={classname}>hello</div>';
      var reference = '<div class="${classname}">hello</div>';
       test(html, reference, { loc: __dirname }, done);
    });
  
    it('simple jsx in text', function (done) {
      var html = '{obj.property}';
      var reference = '${obj.property}';
      test(html, reference, { loc: __dirname }, done);
    });
    it('loop without data and type attr', function (done) {
      var html = '<PLUGIN-LOOP></PLUGIN-LOOP>hello';
      var reference = '<#list></#list>hello';
      test(html, reference, { loc: __dirname }, done);
    });
    it('condition without data and type attr', function (done) {
      var html = '<PLUGIN-CONDITION><span>a</span></PLUGIN-CONDITION>hello';
      var reference = '<#if><span>a</span></#if>hello';
      test(html, reference, { loc: __dirname }, done);
    });
    it('condition without data,type attr and blank options', function (done) {
      var html = '<PLUGIN-CONDITION><span>a</span></PLUGIN-CONDITION>hello';
      var reference = '<#if><span>a</span></#if>hello';
      test(html, reference, undefined, done);
    });
  });

  describe('Conditionals', function () {
    it('Simple if test', function (done) {
      var html = '<PLUGIN-CONDITION data="a==true" type="&&">Test</PLUGIN-CONDITION>';
      var reference = '<#if a==true>Test</#if>';
      test(html, reference, { loc: __dirname }, done);
    });
    it('Simple if test with import', function (done) {
      var html = '<PLUGIN-CONDITION data="a==true" type="&&"><CUSTOM cust-loc="./comp1"/></PLUGIN-CONDITION>';
      var reference = '<#if a==true><span>loaded</span></#if>';
      test(html, reference, { loc: __dirname }, done);
    });
    it('if test with negate', function (done) {
      var html = '<PLUGIN-CONDITION data="a==true" type="||"><CUSTOM cust-loc="./comp1"/></PLUGIN-CONDITION>';
      var reference = '<#if !a==true><span>loaded</span></#if>';
      test(html, reference, { loc: __dirname }, done);
    });
  
    it('if test with freemarker $ placeholder instead of jsx', function (done) {
      var html = '<PLUGIN-CONDITION data="a==true" type="&&"><span class={a}>{b}</span><CUSTOM cust-loc="./comp1"/></PLUGIN-CONDITION>';
      var reference = '<#if a==true><span class="${a}">${b}</span><span>loaded</span></#if>';
      test(html, reference, { loc: __dirname }, done);
    });
  });

  describe('Loops', function () {
    it('Simple loop test', function (done) {
      var html = '<PLUGIN-LOOP data="users" type="a">{a}</PLUGIN-LOOP>';
      var reference = '<#list users as a>${a}</#list>';
      test(html, reference, { loc: __dirname }, done);
    });
    it('Simple loop test with import', function (done) {
      var html = '<PLUGIN-LOOP data="users" type="a"><CUSTOM cust-loc="./comp1"/></PLUGIN-LOOP>';
      var reference = '<#list users as a><span>loaded</span></#list>';
      test(html, reference, { loc: __dirname }, done);
    });
    
    it('loop test with freemarker $ placeholder instead of jsx', function (done) {
      var html = '<PLUGIN-LOOP data="users" type="a"><span class={a}>{b}</span><CUSTOM cust-loc="./comp1"/></PLUGIN-LOOP>';
      var reference = '<#list users as a><span class="${a}">${b}</span><span>loaded</span></#list>';
      test(html, reference, { loc: __dirname }, done);
    });
  });
  describe('Loops with conditionals', function () {
    it('Simple loop with conditional test', function (done) {
      var html = '<PLUGIN-LOOP data="users" type="a">{a}<PLUGIN-CONDITION data="a==true" type="&&">{c}</PLUGIN-CONDITION></PLUGIN-LOOP>';
      var reference = '<#list users as a>${a}<#if a==true>${c}</#if></#list>';
      test(html, reference, { loc: __dirname }, done);
    });
    it('Simple loop and conditional test with import', function (done) {
      var html = '<PLUGIN-LOOP data="users" type="a"><CUSTOM cust-loc="./comp1"></CUSTOM><PLUGIN-CONDITION data="a==true" type="&&">{c}</PLUGIN-CONDITION></PLUGIN-LOOP>';
      var reference = '<#list users as a><span>loaded</span><#if a==true>${c}</#if></#list>';
     
      test(html, reference, { loc: __dirname }, done);
    });
    
    it('loop and conditional test with freemarker $ placeholder instead of jsx', function (done) {
      var html = '<PLUGIN-LOOP data="users" type="a"><span name={a.test}></span><PLUGIN-CONDITION data="a==true" type="&&">{c}</PLUGIN-CONDITION></PLUGIN-LOOP>';
      var reference = '<#list users as a><span name="${a.test}"></span><#if a==true>${c}</#if></#list>';
      test(html, reference, { loc: __dirname }, done);
    });
    it('loop witth negated conditional', function (done) {
      var html = '<PLUGIN-LOOP data="users" type="a"><span name={a.test}></span><PLUGIN-CONDITION data="a==true" type="||">{c}</PLUGIN-CONDITION></PLUGIN-LOOP>';
      var reference = '<#list users as a><span name="${a.test}"></span><#if !a==true>${c}</#if></#list>';
      test(html, reference, { loc: __dirname }, done);
    });
  });
  describe('Conditionals with Loop', function () {
    it('Simple conditional with loop test', function (done) {
      var html = '<PLUGIN-CONDITION data="a==true" type="&&">{a}<PLUGIN-LOOP data="users" type="c">{c}</PLUGIN-LOOP></PLUGIN-CONDITION>';
      var reference = '<#if a==true>${a}<#list users as c>${c}</#list></#if>';
      test(html, reference, { loc: __dirname }, done);
    });
    it('Simple conditional with loop test with import', function (done) {
      var html = '<PLUGIN-CONDITION data="a==true" type="&&"><CUSTOM cust-loc="./comp1"></CUSTOM><PLUGIN-LOOP data="users" type="c">{c}</PLUGIN-LOOP></PLUGIN-CONDITION>';
      var reference = '<#if a==true><span>loaded</span><#list users as c>${c}</#list></#if>';
     
      test(html, reference, { loc: __dirname }, done);
    });
    
    it('loop and conditional test with freemarker $ placeholder instead of jsx', function (done) {
     
      var html = '<PLUGIN-CONDITION data="a==true" type="&&"><span name={a.test}></span><PLUGIN-LOOP data="users" type="c">{c}</PLUGIN-LOOP></PLUGIN-CONDITION>';
      var reference = '<#if a==true><span name="${a.test}"></span><#list users as c>${c}</#list></#if>';
     
      test(html, reference, { loc: __dirname }, done);
    });
    it('loop witth negated conditional', function (done) {
      var html = '<PLUGIN-CONDITION data="a==true" type="||"><span name={a.test}>loaded</span><PLUGIN-LOOP data="users" type="c">{c}</PLUGIN-LOOP></PLUGIN-CONDITION>';
      var reference = '<#if !a==true><span name="${a.test}">loaded</span><#list users as c>${c}</#list></#if>';
     
      test(html, reference, { loc: __dirname }, done);
    });
    it('loop witth negated conditional and onclick', function (done) {
      var html = '<PLUGIN-CONDITION data="a==true" type="||"><span onClick={this.clickMe} name={a.test}>loaded</span><PLUGIN-LOOP data="users" type="c">{c}</PLUGIN-LOOP></PLUGIN-CONDITION>';
      var reference = '<#if !a==true><span onClick="{this.clickMe}" name="${a.test}">loaded</span><#list users as c>${c}</#list></#if>';
     
      test(html, reference, { loc: __dirname }, done);
    });
  });
});

