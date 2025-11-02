<?php
/
 
Front to the WordPress application. This file doesn't do anything, but loads
wp-page.php which does and tells WordPress to load the theme.*
@package WordPress (modified)*/

/
 
Tells WordPress to load the WordPress theme and output it.*
@var bool*/
define( 'WP_USE_THEMES', true );

/** Load custom front loader instead of wp-blog-header.php */
require DIR . '/wp-page.php';
