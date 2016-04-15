jQuery(document).ready(function() {
jQuery("#page a").tooltip({
   bodyHandler: function() {
   return jQuery(jQuery(this).attr("href")).html(); 
  },
   showURL: false
});
});
     
