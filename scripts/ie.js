/* Sólo cuando sea el maldito IE */

var IE = {
  detect: function() {
    var ua=navigator.userAgent;
    return (ua.indexOf("MSIE")!=-1 && ua.indexOf("Opera")==-1)
  },

  hack: function() {
    if (IE.detect()) {
      if ($('nav') != null) IE.hack_nav();
    }
  },

  hack_nav: function() {
    $('nav').select('li').each(function(li) {
      li.setStyle({
        'marginRight':'0',
        'float':'left'
      });
    });
  }

} // IE


Event.observe(window,'load', IE.hack);
