// ==UserScript==
// @name           GetNicovideoInfoCommand
// @namespace      http://d.hatena.ne.jp/Constellation/
// @description    get info on nicovideo / watch nicovideo on another page
// @include        http://www.nicovideo.jp/*
// @auther         Constellation
// @version        0.0.2
// ==/UserScript==

if(!window.Minibuffer) return;

var w = (typeof unsafeWindow == 'undefined') ? window : unsafeWindow;

var CSS = <><![CDATA[
#gm_overlay {
background-color:black;
left:0pt;
position:absolute;
top:0pt;
width:100%;
z-index:1000;
opacity: 0.5;
}
#gm_player {
position: absolute;
text-align:center;
z-index:1500;
}
]]></>.toString();

var l = location.href;
if (/http:\/\/www\.nicovideo\.jp\/(mylist|ranking|search|tag)/.test(l)) var info = RegExp.$1;
else return;

var watchmode = false;
var $X = window.Minibuffer.$X;
var $N = window.Minibuffer.$N;

addStyle(CSS, 'gm_css');
var overlay = $N('div', {id : 'gm_overlay'});
overlay.setAttribute('style','display:none;');
document.body.appendChild(overlay);

window.Minibuffer.addCommand({
  name : 'Nicovideo::GetUserName',
  command : function(stdin){
  stdin.forEach(function(obj){
    switch (info){
      case 'ranking':
      var videoUrl = $X('td/div/h3/a', obj)[0].getAttribute('href');
      var text = $X('td[@class="data"]/p[@class="TXT12"]', obj)[0];
      break;
      case 'search':
      case 'tag':
      var videoUrl = $X('div[@class="cmn_thumb_R"]/p[@class="TXT12"]/a', obj)[0].getAttribute('href');
      var text = $X('div[@class="cmn_thumb_L"]/p[@class="TXT10"]', obj)[0];
      break;
      case 'mylist':
      var videoUrl = $X('td/h3/a', obj)[0].getAttribute('href');
      var text = $X('td/p[@class="TXT12"]', obj)[0];
      break;
    }
    if(/sm(\d*$)/.test(videoUrl)) var videoId = RegExp.$1;
    log(videoId)
    var opt = {
      id : videoId,
      url : 'http://www.smilevideo.jp/view/',
      error : function(){window.Minibuffer.status(videoId, 'Error' + videoId, 100)},
      callback : function(res){
      if(/<strong>(.*?)<\/strong> \u3055\u3093/.test(res.responseText)) {
        var nickname = 'no name';
        nickname = decodeURIComponent(RegExp.$1);
        log(nickname)
        switch(info){
          case 'ranking':
          case 'mylist':
          var data = '\u3000\u0075\u0070\u4E3B\uFF1A<strong>' + nickname + '</strong>';
          break;
          case 'search':
          case 'tag':
          var data = '<br/>\u0075\u0070\u4E3B\uFF1A<strong>' + nickname + '</strong>';
          break;
        }
        text.innerHTML += data;
      }
      window.Minibuffer.status(videoId, 'Loading...done', 100);
      },
    }

    smileAPICallback(opt);
    window.Minibuffer.status(videoId, 'Loading...');

  });
  },
});

window.Minibuffer.addCommand({
  name : 'Nicovideo::WatchVideo',
  command : function(stdin){
  stdin.forEach(function(obj){
    switch(info){
      case 'ranking':
      var videoUrl = $X('td/div/h3/a', obj)[0].getAttribute('href');
      break;
      case 'search':
      case 'tag':
      var videoUrl = $X('div[@class="cmn_thumb_R"]/p[@class="TXT12"]/a', obj)[0].getAttribute('href');
      break;
      case 'mylist':
      var videoUrl = $X('td/h3/a', obj)[0].getAttribute('href');
      break;
    }
    var videoId = videoUrl.match(/sm\d*?$/)[0];
    var url = 'http://www.nicovideo.jp/thumb_watch/' + videoId;
    var pageSize = getPageSize();
    overlay.setAttribute('style','height:' + pageSize[1]+ 'px;display:block;');
    var script = $N('script', {id : 'gm_script', src : url});
    var bak_write = unsafeWindow.document.write;
    unsafeWindow.document.write = function(html) {
      unsafeWindow.document.write = bak_write;
      var player = $N('div', {id : 'gm_player'});
      player.innerHTML = html;
      setCenter(player);
      document.body.appendChild(player);
      unsafeWindow.document.close();
    };
    document.body.appendChild(script);
  });
  watchmode = true;
  },
});

window.Minibuffer.addShortcutkey({
  key: 'N',
  description: 'Nicovideo::GetUserName',
  command: function(){
    var stdin = [];
    try{
    stdin = window.Minibuffer.execute('pinned-or-current-node');
    } catch (e){}
    log(stdin)
    window.Minibuffer.execute('Nicovideo::GetUserName', stdin);
    window.Minibuffer.execute('clear-pin');
  }
});

window.Minibuffer.addShortcutkey({
  key: 'n',
  description: 'Nicovideo::WatchVideo',
  command: function(){
    if(!watchmode){
      var stdin = [];
      try{
      stdin = window.Minibuffer.execute('current-node');
      } catch (e){}
      window.Minibuffer.execute('Nicovideo::WatchVideo', stdin);
    } else {
      ['gm_player', 'gm_script'].forEach(function(id){remove(id);});
      overlay.setAttribute('style','display:none;');
      watchmode = false;
    }
  }
});

function smileAPICallback(obj){
  var list = ['id', 'callback', 'error', 'url'], ok = true;
  list.forEach(function(i){
    if(!obj[i]) ok = false;
  });
  if(ok){
    var opt = {
      method: 'GET',
      url: obj.url + obj.id,
      onload: obj.callback,
      onerror: obj.error
    }
    window.setTimeout(GM_xmlhttpRequest, 0, opt);
  }
}

function addStyle(css,id){
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'data:text/css,' + escape(css);
	document.documentElement.childNodes[0].appendChild(link);
}

function remove(el){
	el = document.getElementById(el);
	el.parentNode.removeChild(el);
}

function setCenter (elm){
var pageSize = getPageSize();
var elmTop = w.scrollY + (385 / 2);
var elmLeft = (pageSize[0] - 485) / 2;
elm.style.top = (elmTop < 0) ? "0px" : elmTop + "px";
elm.style.left = (elmLeft < 0) ? "0px" : elmLeft + "px";
}

// 正直getPageSize作るのが一番時間がかかった。
function getPageSize(){
  var xScroll, yScroll, windowWidth, windowHeight;
  xScroll = w.innerWidth + w.scrollMaxX;
  yScroll = w.innerHeight + w.scrollMaxY;
  windowWidth = self.innerWidth;
  windowHeight = self.innerHeight;
  if(yScroll < windowHeight){
    pageHeight = windowHeight;
  } else {
    pageHeight = yScroll;
  }
  if(xScroll < windowWidth){
    pageWidth = windowWidth;
  } else {
    pageWidth = xScroll;
  }
  var ret = [pageWidth, pageHeight];
  return ret;
}

function log() {if(console) console.log.apply(console, Array.slice(arguments));}
