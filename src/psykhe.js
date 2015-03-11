(function(root, main){

  main.namespace = 'Psykhe';
  main.version   = '0.0.1';

  root[main.namespace + 'JS'] = main;

})(this, function(conf){

  var self = this;

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


  function add_class(el, cls){
    var cur = el.attr('class').split(' ');
    cls.split(' ').map(function(c){
      if(cur.indexOf(c) < 0){
        cur.push(c);
        el.attr('class', cur.join(' '));
      }
    });
  }


  function remove_class(el, cls){
    var cur = el.attr('class').split(' ');
    el.attr('class', cur.filter(function(c){
      return (cls.split(' ').indexOf(c) < 0);
    }).join(' '));
  }


  function has_class(el, cls){
    var cur = el.attr('class').split(' ');
    return cls.split(' ').filter(function(c){
      return cur.indexOf(c) > -1;
    }).length > 0;
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
    return has_class(el, C.prefix +"-"+ C.keeper);
  }

  this.add_group_class = function(el, n){
    add_class(el, C.prefix + '-' + C.group[n]);
  }

  this.remove_group_class = function(el){
    remove_class(el, (C.group.map($.proxy(function(v){
      return C.prefix + '-' + v;
    }, this)).join(' ')));
  }

  this.toggle = function(el, n){
    console.log('has_keeper', this.has_keeper(el));
    if(n !== false && this.has_keeper(el)){
      this.remove_group_class(el);
      this.add_group_class(el, n);
      S.prev = n;
      this.lazy_change(el, n);
    }else{
      this.stop(el);
    }
  }

  this.start = function(el){

    var p = S.prev;
    var n = rand(p, C.group);

    add_class(el, C.prefix +"-"+ C.keeper);
    el.one('mouseout', $.proxy(function(){
      this.stop(el);
    }, this));

    this.toggle(el, n);
  }

  this.stop = function(el){
    remove_class(el, C.prefix +"-"+ C.keeper);
    this.remove_group_class(el);
    S.prev = null;
  }

  this.events.mouseover =  function(e){
    this.start($(e.target));
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
  }

  this.listen = function(){
    $(document).on('mouseover.psyche-event-mouseover', C.selector,
        $.proxy(this.events.mouseover, this));
    $(document).on('mouseout.psyche-event-mouseout', C.selector,
        $.proxy(this.events.mouseout, this));
  }

  this.all = function(){
    $(C.selector).each(function(){
      var el = $(this);
      self.start(el);
    });
  }

  this.disable = function(){
    $(document).off('mouseover.psyche-event-mouseover');
    $(document).off('mouseover.psyche-event-mouseout');
  }

  return this;
});
