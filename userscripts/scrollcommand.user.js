// ==UserScript==
// @name           ScrollCommand
// @namespace      http://d.hatena.ne.jp/Constellation/
// @description    Press j or k key , and scroll (in case that LDRize are not working on its page)
// @include        http://*
// @include        https://*
// @exclude        http://www.google.tld/reader/*
// @exclude        https://www.google.tld/reader/*
// @exclude        http://mail.google.tld/*
// @exclude        https://mail.google.tld/*
// @author         Constellation
// @version        0.0.2
// ==/UserScript==

if(!window.Minibuffer || !window.LDRize) return;
if(window.LDRize.getSiteinfo() != undefined) return;

var SCROLLHEIGHT = 200;
var TIME = 100;

var Scroll = function(down){
  var self = this;
  this.down = down;
  this.i = 0;
  this.height = 0;
  this.delay = TIME / 10;
  setTimeout(function(){self.scrollTo.apply(self, [])}, this.delay);
}

Scroll.prototype.scrollTo = function(){
  var self = this;
  var sin = Math.sin(Math.PI * (++this.i) / 20);
  var height = SCROLLHEIGHT * sin;
  var value = height - this.height;
  this.height = height;

  if(!this.down) value = -(value);

  window.scrollBy(0, value);
  if(this.i < 10) setTimeout(function(){self.scrollTo.apply(self, [])}, this.delay);
}

window.Minibuffer.addShortcutkey({
key:'j',
description: 'scrollcommand::next',
command: function(){
var s = new Scroll(true);
},
});

window.Minibuffer.addShortcutkey({
key:'k',
description: 'scrollcommand::prev',
command: function(){
var s = new Scroll(false);
},
});
