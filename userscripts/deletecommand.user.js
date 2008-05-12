// ==UserScript==
// @name           DeleteCommand
// @namespace      http://d.hatena.ne.jp/Constellation/
// @description    delete tumblr on Minibuffer
// @include        http://www.tumblr.com/dashboard*
// @include        http://www.tumblr.com/show*
// @version        0.0.2
// @auther         Constellation
// ==/UserScript==

if(!window.Minibuffer) return;

window.Minibuffer.addCommand({
  name : 'Tumblr::Delete',
  command : function(stdin){
  stdin.forEach(function(obj){
    if (obj.className.indexOf('is_mine') != -1){
      var id = obj.id.match(/post([\d]+)/)[1];
      log(id);
      window.Minibuffer.status('DeleteCommand'+id, 'Delete...');

      var data = 'id=' + encodeURIComponent(id);
      var url = 'http://www.tumblr.com/delete';
      var referrer = 'http://www.tumblr.com';

      var req = new XMLHttpRequest();
      req.open('POST', url, true);

      req.onreadystatechange = function(){
        if(req.readyState == 1)
        req.setRequestHeader('Referer', referrer);
        if(req.readyState == 4) {
          if (req.status == 200)
            window.Minibuffer.status('DeleteCommand'+id, 'Delete... done.', 100);
          else
            window.Minibuffer.status('DeleteCommand'+id, 'Delete... error.', 150);
        }
      }

      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      req.send(data);

    }
  });
  return stdin;
  },
});

window.Minibuffer.addShortcutkey({
  key: 'D',
  description: 'Tumblr::Delete',
  command: function(){
    var stdin = [];
    try{
    stdin = window.Minibuffer.execute('pinned-or-current-node');
    } catch (e){}
    window.Minibuffer.execute('Tumblr::Delete', stdin);
    window.Minibuffer.execute('clear-pin');
  }
  });

function log() {if(console) console.log.apply(console, Array.slice(arguments));}
