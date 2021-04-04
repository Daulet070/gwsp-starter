import $ from 'jquery';

const hi = 'I am module header!';
console.log(hi);
  
/*----------------------------------------------------*/
/* Navigation
------------------------------------------------------ */

$(window).scroll(function() {

  if ($(window).scrollTop() > 300) {
    $('.main_nav').addClass('sticky');
  } else {
    $('.main_nav').removeClass('sticky');
  }
});

// Mobile Navigation
$('.mobile-toggle').click(function() {
  if ($('.main_nav').hasClass('open-nav')) {
    $('.main_nav').removeClass('open-nav');
  } else {
    $('.main_nav').addClass('open-nav');
  }
});

$('.main_nav li a').click(function() {
  if ($('.main_nav').hasClass('open-nav')) {
    $('.navigation').removeClass('open-nav');
    $('.main_nav').removeClass('open-nav');
  }
});
