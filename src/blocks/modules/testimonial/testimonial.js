import $ from 'jquery';

const testimonial = () => {
/*----------------------------------------------------*/
/* Quote Loop
------------------------------------------------------ */

  function fade($ele) {
    $ele.fadeIn(1000).delay(3000).fadeOut(1000, function() {
      let $next = $(this).next('.quote');
      fade($next.length > 0 ? $next : $(this).parent().children().first());
    });
  }
  fade($('.quoteLoop > .quote').first());
};

export {testimonial};