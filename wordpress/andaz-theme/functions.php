<?php
/**
 * Andaz static-style marketing theme.
 * Booking is currently WhatsApp enquiry only; no PMS writes are performed.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'after_setup_theme', static function () {
    add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption' ) );
    add_theme_support( 'responsive-embeds' );
} );

add_action( 'wp_enqueue_scripts', static function () {
    if ( is_front_page() ) {
        wp_enqueue_script(
            'andaz-booking-enquiry',
            get_template_directory_uri() . '/assets/booking.js',
            array(),
            '0.1.0',
            true
        );
    }
} );
