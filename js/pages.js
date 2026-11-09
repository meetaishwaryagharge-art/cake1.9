(function(){
  /* scroll reveal (same behaviour as home page) */
  var els=[].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
    els.forEach(function(el){io.observe(el);});
  }else{els.forEach(function(el){el.classList.add('in');});}
  /* close mobile menu after choosing a link */
  var menu=document.getElementById('nav');
  if(menu&&window.bootstrap){document.querySelectorAll('#nav a:not([data-bs-toggle])').forEach(function(a){a.addEventListener('click',function(){if(menu.classList.contains('show'))bootstrap.Collapse.getOrCreateInstance(menu).hide();});});}
  /* image fallback */
  var FB='https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=700&q=75';
  document.querySelectorAll('img[data-fb]').forEach(function(m){m.addEventListener('error',function(){if(m.src!==FB)m.src=FB;},{once:true});});
})();
