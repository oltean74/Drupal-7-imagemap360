(function($) {

  Drupal.behaviors.imaginePanoramaNode = {
    attach: function(context, settings) {
    $("img.imagine-panorama").imagemap360({
                   auto_start: 0,
         start_position: 15
            });
		}
	};
 })(jQuery);
     
