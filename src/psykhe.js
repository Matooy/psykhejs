(function(root, main){

  main.namespace = 'Psykhe';
  main.version   = '0.0.1';

  root[main.namespace + 'JS'] = main;

})(this, function(conf){

  this.config = $.extend({
    selector:   '.psykhe',
    prefix:     'psykhe',
    keeper:     'trans',
    transition: [0.6, "linear"],
    group:      []
  }, conf || {});

  this.state = {
    prev: null
  };

  this.events = {};

  var C = this.config;
  var S = this.state;

  function rand(prev, src){
    var num = Math.floor((Math.random() * src.length));
    return (num == prev)
      ? rand(num, src)
      : num;
  }


  this.lazy_change = function(el, p){
    setTimeout($.proxy(this.group_applier(el, p), this), C.transition[0]*1000);
  }

  this.group_applier = function(el, p){
    return function(){
      if(!this.has_keeper(el)) return this.stop(el);
      this.toggle(el, rand(p, C.group));
    }
  }

  this.has_keeper = function(el){
    return el.hasClass(C.prefix +"-"+ C.keeper);
  }

  this.add_group_class = function(el, n){
    el.addClass(C.prefix + '-' + C.group[n]);
  }

  this.remove_group_class = function(el){
    el.removeClass((C.group.map($.proxy(function(v){
      return C.prefix + '-' + v;
    }, this)).join(" ")));
  }

  this.toggle = function(el, n){
    if(n !== false){
      this.remove_group_class(el);
      this.add_group_class(el, n);
      S.prev = n;
      this.lazy_change(el, n);
    }else{
      this.stop(el);
    }
  }

  this.start = function(el){
    el.addClass(C.prefix +"-"+ C.keeper);
    el.one('mouseout', $.proxy(function(){
      this.stop(el);
    }, this));
  }

  this.stop = function(el){
    el.removeClass(C.prefix +"-"+ C.keeper);
    this.remove_group_class(el);
    S.prev = null;
  }

  this.events.mouseover =  function(e){
    var p = S.prev;
    var n = rand(p, C.group);
    var el = $(e.target);

    this.start(el);
    this.toggle(el, n);
  }

  this.events.mouseout = function(e){
    this.stop($(e.target));
  }

  this.init_style = function(){
    if($('.'+C.prefix+'-style[data-selector="'+C.selector+'"]').length == 0){
      var st = $('<style>');
      var tm = C.transition[0];
      var es = C.transition[1];
      st.attr('class', C.prefix + '-style');
      st.attr('data-selector', C.selector);
      st.text(C.selector+"{-webkit-transition: all "+tm+"s "+es+"; -moz-transition: all "+tm+"s "+es+"; -ms-transition: all "+tm+"s "+es+"; -o-transition: all "+tm+"s "+es+"; transition: all "+tm+"s "+es+" !important;}");
      $('head').append(st);
    }
  }

  this.enable = function(){
    this.init_style();
    $(document).on('mouseover.psyche-event-mouseover', C.selector,
        $.proxy(this.events.mouseover, this));
    $(document).on('mouseout.psyche-event-mouseout', C.selector,
        $.proxy(this.events.mouseout, this));
  }

  this.disable = function(){
    $(document).off('mouseover.psyche-event-mouseover');
    $(document).off('mouseover.psyche-event-mouseout');
  }

  return this;
});
