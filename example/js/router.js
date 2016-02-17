(function(win){

  // 每个target只显示一个page
  // 每个page加载一次
  // 每个page只能在一个target里显示

  //==================================================
  var _setting = {
        main     : 'router',
        otherwise: 'otherwise',
        notexist : 'notexist'
      },
      _views   = {},
      _links   = {},
      _events  = {},
      _scripts = [],
      _wrap, _hash, _param, _page, _target, _script_src, _script_sum, _script_cnt;

  var ROUTER = {
    config  : config_6,
    addEvent: addEvent
  };

  // -> setHash_5
  function config_6(obj){
    for(var i in obj){
      _setting[i] = obj[i];
    }
    _wrap = document.querySelector('[_app=' + _setting.main + ']') || document.body;

    var _script_node = document.querySelectorAll('script');
    var src;
    for(var i = 0, l = _script_node.length; i < l; i++){
      src = _script_node[i].src;
      if(src && !inArray(src, _scripts)){
        _scripts.push(src);
      }
    }
    onhashchange = function(){
      setHash_5();
    };
    onhashchange();
  }

  // -> loadPage_4 带缓冲
  function setHash_5(){
    var hash = location.hash;
    if(hash[0] == '#'){
      hash = hash.slice(1);
    }

    if(_hash != hash){
      var hash_arr = hash.split('?');
      var page_arr = hash_arr[0].split('@');
      _hash        = hash;
      _param       = hash_arr[1];
      _page        = page_arr[0];
      _target      = page_arr[1] || '_view';
      loadPage_4(_page);
    }
  }

  // 一次性加载page  ->loadScript_3, showPage_1 带缓存
  function loadPage_4(page){
    if(!page){
      page = _setting.otherwise;
    }

    if(_links[page] == 'error'){
      if(page == _setting.otherwise){
        //没有缺省页面
      }
      else if(page == _setting.notexist){
        loadPage_4(_setting.otherwise);
      }
      else{
        loadPage_4(_setting.notexist);
      }
      return;
    }

    _page = page;

    if(!_links[_page]){
      _links[_page] = {};
    }

    if(_links[_page].response){
      showPage_1();
      return;
    }

    var x = new XMLHttpRequest();
    x.open('GET', _page + '.html', true);

    x.onreadystatechange = function(){
      if(x.readyState == 4){
        if(x.status != 200){
          _links[_page] = 'error';
          loadPage_4(_page);
        }
        else{
          loadScript_3(x.response);
        }
      }
    };
    try{
      x.send('');
    }
    catch(e){
      console.log(e);
    }
  }

  // -> loadEvent_2 带延迟加载
  function loadScript_3(response){
    _script_src = '';
    _script_sum = 1;
    _script_cnt = 0;
    var html    = response.replace(/<script([^<]+|<(?!\/script>))+<\/script>/ig, function(a){
      var pos_1         = a.indexOf('>');
      var pos_2         = a.indexOf('</script>');
      var source_script = a.substring(pos_1 + 1, pos_2).trim();

      // 一次性加载script
      if(source_script){
        _script_src += source_script;
      }
      else{
        //href方式
        var script    = document.createElement('script');
        var href      = a.substring(7, pos_1);
        var match_arr = /src=['"](.+)['"]/gi.exec(href);
        var src       = match_arr[1];
        if(!/[http|https]:\/\//ig.test(src)){
          var full_src = document.location.origin + document.location.pathname + src;
          while(full_src != src){
            src      = full_src;
            full_src = full_src.replace(/[^\/]+\/\.\.\//ig, '');
          }
          //经过一番替换，src 已经是最简练的了
        }
        if(src && !inArray(src, _scripts)){
          _script_sum++;
          script.onload = function(){
            _script_cnt++;
            loadEvent_2();
          };

          script.src = src;
          document.body.appendChild(script);

          _scripts.push(src);
        }
      }

      return '';
    });

    _links[_page] = {
      response: response,
      html    : html,
      obj     : {},
      param   : _param
    };

    _script_cnt++;
    loadEvent_2();
  }

  // -> showPage_1, runEvent
  function loadEvent_2(){
    if(_script_sum != _script_cnt){
      return;
    }
    else if(_script_src){
      var script       = document.createElement('script');
      script.innerHTML = _script_src;
      document.body.appendChild(script);
    }

    runEvent('init');

    showPage_1();
  }

  // -> runEvent 显示当前页
  function showPage_1(){
    if(!_views[_target]){
      _views[_target] = _wrap.querySelector('#' + _target) || document.body;
    }

    var v = _views[_target];

    // 删除存在于其他view的node
    if(_links[_page] && _links[_page].target && _links[_page].target != _target){
      var node = _links[_page].node;
      node.parentNode.removeChild(node);
    }

    var node = v.querySelector('#' + _page);

    if(!node){
      node                 = document.createElement('div');
      node.id              = _page;
      node.innerHTML       = _links[_page].html;
      v.appendChild(node);
      _links[_page].node   = node;
      _links[_page].target = _target;

      runEvent('load');
    }

    var child;
    // v 的 children 都仅是加载的 page
    for(var i = 0, l = v.children.length; i < l; i++){
      child               = v.children[i];
      child.style.display = child.id == _page ? '' : 'none'; //动画效果可以在这里加
    }
  }

  function addEvent(pagename, obj){
    _events[pagename] = obj;
  }

  function runEvent(event){
    var fn = _events[_page][event];
    if(fn){
      fn(_links[_page].obj, _links[_page].param);
    }
  }

  //==================================================
  if(typeof module != 'undefined' && module.exports && module !== module){
    module.exports = ROUTER;
  }
  else if(typeof define === 'function' && define.amd){
    define(ROUTER);
  }
  else{
    win.ROUTER = ROUTER;
  }
})(this);

function inArray(str, arr){
  var search = ' ' + arr.join(' ') + ' ';
  return search.indexOf(' ' + str + ' ') > -1;
}

/*
 var dynamicLoading = {
 css: function(path){
 if(!path || path.length === 0){
 throw new Error('argument "path" is required !');
 }
 var head  = document.getElementsByTagName('head')[0];
 var link  = document.createElement('link');
 link.href = path;
 link.rel  = 'stylesheet';
 link.type = 'text/css';
 head.appendChild(link);
 },
 js : function(path){
 if(!path || path.length === 0){
 throw new Error('argument "path" is required !');
 }
 var head    = document.getElementsByTagName('head')[0];
 var script  = document.createElement('script');
 script.src  = path;
 script.type = 'text/javascript';
 head.appendChild(script);
 }
 };
 */