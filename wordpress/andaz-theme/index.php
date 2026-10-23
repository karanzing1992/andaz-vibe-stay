<?php
/** Fallback page for non-home routes. Front-page.php owns the full homepage shell. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html( wp_get_document_title() ); ?></title>
<?php wp_head(); ?>
<style>
*{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1b1b17;background:#f5eee5;margin:0}
main{max-width:820px;margin:auto;padding:4rem 1.3rem}a{color:#a4442f}
</style>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<main id="main-content">
<a href="<?php echo esc_url( home_url( '/' ) ); ?>">← Andaz Vibe Stay</a>
<?php
if ( have_posts() ) :
    while ( have_posts() ) :
        the_post();
        ?>
        <article <?php post_class(); ?>>
          <h1><?php the_title(); ?></h1>
          <div><?php the_content(); ?></div>
        </article>
        <?php
    endwhile;
else :
    ?>
    <h1>Page not found</h1>
    <p><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Return to Andaz Vibe Stay</a></p>
    <?php
endif;
?>
</main>
<?php wp_footer(); ?>
</body></html>
