jQuery(function($) {
    "use strict";

    $.noConflict();


    /* ----------------------------------------------------------- */
    /*  Animation
    /* ----------------------------------------------------------- */
    new WOW().init();


    /* ----------------------------------------------------------- */
    /*  Prettyphoto
    /* ----------------------------------------------------------- */
    $("a[data-rel^='prettyPhoto']").prettyPhoto();



    /* ==============================================
        Menu toggle
    =============================================== */ 

    $('a.page-scroll').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 40
                }, 900);

                return false;
            }
        }
    });


    /*==================================================
        Show Menu on Book
    ====================================================*/
  
    $(window).bind('scroll', function() {
        var navHeight = $(window).height() - 40;

        if ($(window).scrollTop() > navHeight) {
            $('.navbar-default').addClass('on');
        } else {
            $('.navbar-default').removeClass('on');
        }
    });

    $('body').scrollspy({ 
        target: '.navbar-default',
        offset: 80
    });

    /* Smooth Scroll */
    smoothScroll.init({
        speed: 400,
        easing: 'easeInQuad',
        offset:0,
        updateURL: true,
        callbackBefore: function ( toggle, anchor ) {},
        callbackAfter: function ( toggle, anchor ) {}
    });
});