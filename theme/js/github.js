var github = (function(){
  function escapeHtml(str) {
    var tnode = document.createTextNode(str);
    var p = document.createElement('p');
    p.appendChild(tnode);
    return p.innerHTML;
  }
  function render(target, repos){
    var i = 0, fragment = '', t = document.getElementById(target);
    fragment += '<ul class="list-group" id="github">';

    for(i = 0; i < repos.length; i++) {
      fragment += '<li class="list-group-item"><a href="'+repos[i].html_url+'">'+repos[i].name+'</a><p><small>'+escapeHtml(repos[i].description||'')+'</small></p></li>';
    }
    fragment += '</ul>';
    t.innerHTML = fragment;
  }

  function success(options, data) {
      var repos = [];
      if (!data) { return; }
      for (var i = 0; i < data.length; i++) {
          if (options.skip_forks && data[i].fork) { continue; }
          repos.push(data[i]);
      }
      repos.sort(function(a, b) {
          var aDate = new Date(a.pushed_at).valueOf(),
          bDate = new Date(b.pushed_at).valueOf();

          if (aDate === bDate) { return 0; }
          return aDate > bDate ? -1 : 1;
      });

      if (options.count) { repos.splice(options.count); }
      render(options.target, repos);
  }

  function error(options) {
      var statusP = document.getElementById(options.target).getElementsByClassName('loading-status')[0];
      statusP.innerHTML = "Error loading feed";
      statusP.classList.add('error');
  }

  return {
    showRepos: function(options){
        var xhr = new XMLHttpRequest();
        var stateChange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    success(options, JSON.parse(xhr.response));
                } else {
                    error(options);
                }
            }
        };
        xhr.onreadystatechange = stateChange;
        xhr.open("GET", "https://api.github.com/users/"+options.user+"/repos");
        xhr.send();
    }
  }
})();
