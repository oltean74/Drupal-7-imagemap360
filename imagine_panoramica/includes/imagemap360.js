/*
 * imagemap360 - jQuery plugin
 * Created by Oltean Ioan (http://e1oltean.com)
 */
        (function($) {
            $.fn.imagemap360 = function(options) {
                this.each(function() {
					//default options for panorama image
                    var settings = {
                        viewport_width: parseInt($(this).attr('height')) * 2,
                        speed: 50000,
                        direction: 'left',
                        control_display: 'auto',
                        image_width: 0,
                        image_height: 0,
                        start_position: 0,
                        auto_start: true,
                        mode_360: false
                    };
                    if (options) $.extend(settings, options);
                    // check if page have meta viewport 
                    var viewport = document.querySelector('meta [name=viewport]');
                    var viewportContent = 'width=device-width, initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0';
                    // otherwise it is set up automaticaly
                    if (viewport === null) {
                        var head = document.getElementsByTagName('head')[0];
                        viewport = document.createElement('meta');
                        viewport.setAttribute('name', 'viewport');
                        head.appendChild(viewport);
                    }
                    viewport.setAttribute('content', viewportContent);
                    //store in variables the original dimension of image
                    var ew = parseInt($(this).attr('width'));
                    var eh = parseInt($(this).attr('height'));
                    var cE = this;
                    var pV, pC;
                    var body = null;
                    var fullscreen = 0;
                    //construct the container that hold the image
                    $(this).attr('unselectable', 'on').css('position', 'relative').css('-moz-user-select', 'none').css('-webkit-user-select', 'none').css('margin', '0').css('padding', '0').css('border', 'none').wrap("<div class='imagemap360-container'></div>");
                    if (settings.mode_360) $(this).clone().insertAfter(this);
                    // now container need a viewport to show the image
                    pC = $(this).parent();
                    pC.css('height', eh + 'px').css('overflow', 'hidden').wrap("<div class='imagemap360-viewport'></div>").parent().css('width', settings.viewport_width + 'px')
                        .append("<div class='imagemap360-control'><a href='#' class='imagemap360-control-left'><img src='../sites/all/modules/imagine_panoramica/img/Back.png'/></a> <a href='#fullscreen' class='imagemap360-control-full'><img src='../sites/all/modules/imagine_panoramica/img/ArrowOut.png'/></a> <a href='#normal' class='imagemap360-control-nofull'><img src='../sites/all/modules/imagine_panoramica/img/ArrowIn.png'/></a> <a href='#' class='imagemap360-control-right'><img src='../sites/all/modules/imagine_panoramica/img/Forward.png'/></a><a class='combo'><select><option value='40000'>Slow</option><option value='20000' selected>Normal</option><option value='5000'>Fast</option></select></a></div>");
                    // start the construction of imagemap360 image 
                    pV = pC.parent();
                    pI = pC.find('img');
                    mlk = pI.attr('usemap');
                    // setting up fullscreen control
                    var full = $(pV.find('a.imagemap360-control-full')),
                        nofull = $(pV.find('a.imagemap360-control-nofull'));
                    $(window).load(function() {
                        full.show(), nofull.hide();
                    });
                    // get image dimensions
                    if (!(0 >= settings.image_width && 0 >= settings.image_height) || (settings.image_width = parseInt(ew), settings.image_height = parseInt(eh), settings.image_width && settings.image_height));
                    //clone areamap coords  
                    var areamap,
                        upscale = settings.image_height / settings.image_width,
                        heightImg = parseInt($(this).height()),
                        newscale = parseInt(heightImg / upscale),
                        mlk = pI.attr("usemap");
                    mlk && (0 > mlk.indexOf("#") && (mlk = "#" + mlk), new_area = $("a").addClass("area"), $("map").find("area").each(function() {
                            switch ($(this).attr("shape").toLowerCase()) {
                                case "rect":
                                    var areacoords = $(this).attr("coords").split(","),
                                        newmap = $(document.createElement("a")).addClass("area").attr("href", $(this).attr("href")).attr("title", $(this).attr("alt"));
                                    newmap.addClass($(this).attr("class")), pC.append(newmap.data("stitch", 1).data("coords", areacoords)),
                                        pC.append(newmap.clone().data("stitch", 2).data("coords", areacoords))
                            }
                        }),
                        $("map" + mlk, pC).remove(),
                         areamap = pC.find(".area"),
                         updatecoord(areamap, settings.image_height, heightImg, newscale));
              
                    //setting up controls reactions 
                    pV.css('height', eh + 'px').css('overflow', 'hidden').find('a.imagemap360-control-left').bind('click', function() {
                        $(pC).stop();
                        settings.direction = 'right';
                        imagemap360_animate(pC, settings, fullscreen);
                        return false;
                    });
                    pV.bind('click', function() {
                        $(pC).stop();
                    });
                    
                    pV.find('a.imagemap360-control-right').bind('click', function() {
                        $(pC).stop();
                        settings.direction = 'left';
                        imagemap360_animate(pC, settings, fullscreen);
                        return false;
                    });
                    pV.find('a.imagemap360-control-full').bind('click', function() {
                       
                            fullscreen = 1;
                            loadspinner();
                            pV.addClass('full');
                            resizeViewport();
                            resizeContainer();
                            $parent = $(window), heightImg = parseInt($parent.height()),
                                newscale = parseInt(heightImg / upscale), mlk && updatecoord(areamap, settings.image_height, heightImg, newscale);
                            $(this).hide();
                            $(nofull).show();
                            //on changing screen orientation, must hold all toghether  
                            $(window).resize(function(event) {
                                loadspinner();
                                resizeViewport();
                                resizeContainer();
                                settings.speed = $(".combo option:selected").val();
                                $parent = $(this), heightImg = parseInt($parent.height()),
                                    newscale = parseInt(heightImg / upscale), mlk && updatecoord(areamap, settings.image_height, heightImg, newscale);
                            }).trigger('resize');
                     
                    });
                    pV.find('a.imagemap360-control-nofull').bind('click', function() {
                        fullscreen = 0;
                        // exit fullscreen
                        pV.removeClass('full');
                        loadspinner();
                        restoreContainer();
                        $parent = pC, heightImg = parseInt($parent.height()),
                            newscale = parseInt(heightImg / upscale), mlk && updatecoord(areamap, settings.image_height, heightImg, newscale);
                    });
//functions that we need to do all this:
                    // resize on screen  orientation change and fullscreen mode
                    resizeViewport = function() {
                        var browserwidth = $(window).width(),
                            browserheight = $(window).height(),
                            offset;
                        resizeWidth();

                        function resizeWidth(minimum) {
                            pV.css('width', browserwidth + 'px');
                            pV.css('height', browserheight + 'px');
                        };
                    };
                    resizeContainer = function() {
                        var ratio = (ew / eh).toFixed(2);
                        var browserwidth = $(window).width(),
                            browserheight = $(window).height(),
                            offset;
                        var newWidth = browserheight * ratio;
                        updateWidth();

                        function updateWidth(minimum) {
                            var newimage = pC.find('img');
                            newimage.width(newWidth);
                            newimage.height(browserheight);
                            pC.css('height', browserheight + 'px');
                            
                        };
                    };
                    restoreContainer = function() {
                        var tempWidth = ew;
                        var tempHeight = eh;
                        restoreWidth();

                        function restoreWidth(minimum) {
                            var origimage = pC.find('img');
                            origimage.width(tempWidth);
                            origimage.height(tempHeight);
                            pV.css('width', settings.viewport_width + 'px');
                            pV.css('height', tempHeight + 'px');
                            pC.css('height', tempHeight + 'px');
                        };
                        full.show(), nofull.hide();
                    };
                    //setting up a loader for resize event
                    var overlay = jQuery('<div id="overlay"> </div>');
                    var spinn = jQuery('<div id="spinner"> </div>');
                    spinn.appendTo(document.body);
                    overlay.appendTo(document.body);
                    spinn.hide();
                    overlay.hide();
                    loadspinner = function() {
                        spinn.show();
                        overlay.show();
                        setTimeout(function() {
                            spinn.hide();
                            overlay.hide();
                        }, 2000);
                    };
                    //display controls 
                    showcontrols = function() {
                        pV.find('.imagemap360-control').show();
                        setTimeout(function() {
                            pV.find('.imagemap360-control').hide();
                        }, 10000);
                    };
                    if (settings.control_display == 'yes') {
                        pV.find('.imagemap360-control').show();
                    } else if (settings.control_display == 'auto') {
                        $(this).bind('click', function() {
                            showcontrols();
                        });
                    }
 
                    $(this).parent().css('margin-left', '-' + settings.start_position + 'px');
                    if (settings.auto_start)
                        imagemap360_animate(pC,settings,fullscreen);
                });

                function updatepos($) {
                    return e.preventDefault(), !1
                }
                //on resize event image dimension is changing so, must update coords according to the new dimension
                function updatecoord(map, s_height, s_width, img_width) {
                    var scale = s_width / s_height;
                    map.each(function() {
                        switch (area_coord = $(this).data("coords"), stitch = $(this).data("stitch")) {
                            case 1:
                                $(this).css({
                                    left: area_coord[0] * scale + "px",
                                    top: area_coord[1] * scale + "px",
                                    width: (area_coord[2] - area_coord[0]) * scale + "px",
                                    height: (area_coord[3] - area_coord[1]) * scale + "px"
                                });
                                break;
                            case 2:
                                $(this).css({
                                    left: img_width + parseInt(area_coord[0]) * scale + "px",
                                    top: area_coord[1] * scale + "px",
                                    width: (area_coord[2] - area_coord[0]) * scale + "px",
                                    height: (area_coord[3] - area_coord[1]) * scale + "px"
                                })
                        }
                    })
                }
                //animating all scene
 
                function imagemap360_animate(element,settings,fullscreen) {
                    currentPosition = 0 - parseInt($(element).css('margin-left'));
                    ew = parseInt($('img').width());
                    if (settings.direction == 'right') {
                        $(element).animate({
                            marginLeft: 0
                        }, (($(".combo option:selected").val() / ew) * (currentPosition)), 'linear', function() {
                            if (settings.mode_360) {
								 if (fullscreen==1)
							    $(element).css('marginLeft', '-' + (ew-$(window).width()) + 'px');
							    else
							    $(element).css('marginLeft', '-' + ew + 'px');
                               imagemap360_animate(element, settings, fullscreen) 
                            }
                        });
                    } else {
                        var rightlimit;
                        if (settings.mode_360){
                          if (fullscreen==1)
                           rightlimit = ew-$(window).width();
                          else 
                           rightlimit = ew;
					   }
                        else {
                          if (fullscreen==1)
                            rightlimit = ew - $(window).width(); 
                          else
                            rightlimit = ew - settings.viewport_width;
                        }  
                        $(element).animate({
                           marginLeft: -rightlimit
                        }, (($(".combo option:selected").val() / rightlimit) * (rightlimit - currentPosition)), 'linear', function() {
                            if (settings.mode_360) {
                                $(element).css('margin-left', 0);
                               imagemap360_animate(element, settings, fullscreen)
                            }
                        });
                    }
                }
            };
            $(document).ready(function() {
                $("img.imagemap360").imagemap360();
            });
        })(jQuery);
