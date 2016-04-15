(function($) {

  Drupal.behaviors.imaginePanoramaEdit = {
    attach: function(context, settings) {

      function deleteEmptyItems(panoramaData) {
        panoramaData.find('.imagine-panorama-data-item').each(function() {
          if (typeof $(this).attr('x1') === 'undefined') {
            $(this).remove();
          }
        });
      }

      function collectDataItems(editContainer, panoramaDataDiv, panoramaImg) {
        // collect data from all items
        var coordInput = editContainer.find('.imagine-panorama-coordinates input'),
          panoramaItems = panoramaDataDiv.find('.imagine-panorama-data-item'),
          panoramaData = new Array();

        panoramaItems.each(function() {
          if ($(this).attr('x1')) {
            panoramaData.push({
              'title': $(this).find('.img-panorama-title').val().replace(/"/g, '\''),
              'description': $(this).find('.img-panorama-descr').val().replace(/"/g, '\''),
              'x1': Math.round(100 / (panoramaImg.width() / $(this).attr('x1'))),
              'x2': Math.round(100 / (panoramaImg.width() / $(this).attr('x2'))),
              'y1': Math.round(100 / (panoramaImg.height() / $(this).attr('y1'))),
              'y2': Math.round(100 / (panoramaImg.height() / $(this).attr('y2')))
            });
          }
        });
        if (panoramaData.length > 0) {
          coordInput.val($.toJSON(panoramaData));
        }
        else {
          coordInput.val('');
        }
      }

      $('.imagine-panorama-edit:not(.with-jcrop)', context).each(function() {

        // main data
        var panoramaImg = $(this).find('.imagine-panorama-img img'),
          jcrop = $.Jcrop(panoramaImg),
          panoramaInputs = $(this).find('.imagine-panorama-inputs'),
          panoramaAddBtn = $(this).find('.imagine-panorama-add'),
          panoramaDataDiv = $(this).find('.imagine-panorama-data'),
          existPanoramacoords = panoramaDataDiv.find('.imagine-panorama-data-item'),
          editContainer = $(this);
        $(this).addClass('with-jcrop');

        // panoramic form
        if (existPanoramacoords.length > 0) {
          panoramaDataDiv.find('.img-panorama-data-wrapper').hide();
        }
        else {
          panoramaDataDiv.html(panoramaInputs.html());
        }
        panoramaDataDiv.append(panoramaAddBtn.html());

        // add others coordinates  
        $(this).find('.img-panorama-add').click(function() {
          deleteEmptyItems(panoramaDataDiv);
          panoramaDataDiv.find('.img-panorama-data-wrapper').hide();
          $(this).before(panoramaInputs.html());
          jcrop.setSelect([0, 0, 0, 0]);
          jcrop.release();
          return false;
        });

        // save panorama coordinates
        panoramaDataDiv.delegate('.img-panorama-save', 'click', function() {
          // current item changes
          var selection = jcrop.tellSelect(),
            panoramaTitle = $(this).parent().find('.img-panorama-title');

          if (panoramaTitle.val() === '') {
            alert(Drupal.t('Panorama title field is required.'));
          }
          else if (selection.h > 0) {
            var panoramaItem = $(this).parent().parent();
            panoramaItem.attr({
              'x1': selection.x,
              'x2': selection.x2,
              'y1': selection.y,
              'y2': selection.y2
            });
            $(this).parent().hide().prev().text(panoramaTitle.val());
            jcrop.release();
            collectDataItems(editContainer, panoramaDataDiv, panoramaImg);
          }
          else {
            alert(Drupal.t('Please select an area on the image.'));
          }
          return false;
        });

        // select coordinates
        panoramaDataDiv.delegate('.img-panorama-data-title', 'click', function() {
          var item = $(this).parent();
          jcrop.setSelect([item.attr('x1'), item.attr('y1'), item.attr('x2'), item.attr('y2')]);
          deleteEmptyItems(panoramaDataDiv);
          panoramaDataDiv.find('.img-panorama-data-wrapper').hide();
          $(this).next().show();
          return false;
        });

        // remove coordinates
        panoramaDataDiv.delegate('.img-panorama-remove', 'click', function() {
          $(this).parent().parent().remove();
          jcrop.release();
          collectDataItems(editContainer, panoramaDataDiv, panoramaImg);
          return false;
        });
      });
    }
  }

  Drupal.behaviors.imaginePanoramaView = {
    attach: function(context, settings) {

      if (settings.imaginePanoramica) {
        $('.imagine-panorama').each(function() {
          $(this).parents('.field-item').wrapInner('<div class="imagine-panorama-wrapper">');
          var imageId = $(this).attr('id').split('-'),
            fid = 'fid' + imageId[2],
            panoramicacoords = eval('settings.imaginePanoramica.' + fid);

          if (panoramicacoords) {
            var imgWidth = $(this).width(),
              imgHeight = $(this).height(),
              imageWrap = $(this).parent(),
              imageSrc = $(this).attr('src'),
              classIndex = 0,
              panoramicacoordIndex = 0,
              panoramaTitles = '',
              comma = ', ';

            $.each(panoramicacoords, function(i, panoramicacoord) {
              if (i % 10 === 0) {
                classIndex = 0;
              }
              if (i === (panoramicacoords.length - 1)) {
                comma = '';
              }
              classIndex++;
              panoramicacoordIndex++;
              panoramaTitles += '<span class="panoramicacoord-title" panoramicacoord="' + panoramicacoordIndex + '">' + panoramicacoord.title + comma + '</span>';
              var hWidth = Math.round(imgWidth / (100 / panoramicacoord.x2));
                hHeight = Math.round(imgHeight / (100 / panoramicacoord.y2)),
                hTop = Math.round(imgHeight / (100 / panoramicacoord.y1)),
                hLeft = Math.round(imgWidth / (100 / panoramicacoord.x1));
              // add panoramicacoord item
              imageWrap.append('<map id="imagine" name="imagine"><area shape="rect" class="img-panoramicacoord-box" img-panorama-descr="' + panoramicacoord.title + '" href="#panorama_' + panoramicacoordIndex +'"   '
                + 'coords="' + hLeft + ',' + hTop + ',' + hWidth + ',' + hHeight + '"</area></map>');
              imageWrap.append('<div style="display:none"><div id="panorama_' + panoramicacoordIndex +'" style="padding:10px; background:#fff;"><div class="tooltip-titlu"><p><h3>' + panoramicacoord.title + '</h3></p></div><p><strong>' + panoramicacoord.description + '</p></strong></div></div>');
});
           }
        });
      }
    }
  }

})(jQuery);
