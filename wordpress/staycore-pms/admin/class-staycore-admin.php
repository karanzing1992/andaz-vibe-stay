<?php
if (!defined('ABSPATH')) exit;

final class StayCore_Admin {
    public static function boot(): void {
        add_action('admin_menu', [__CLASS__, 'menu']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'assets']);
    }

    public static function menu(): void {
        add_menu_page(
            'StayCore PMS',
            'StayCore PMS',
            'manage_staycore_pms',
            'staycore-pms',
            [__CLASS__, 'render'],
            'dashicons-building',
            3
        );
    }

    public static function assets(string $hook): void {
        if ($hook !== 'toplevel_page_staycore-pms') return;
        wp_enqueue_style('staycore-pms', STAYCORE_PMS_URL . 'admin/assets/app.css', [], STAYCORE_PMS_VERSION);
        wp_enqueue_script('staycore-pms', STAYCORE_PMS_URL . 'admin/assets/app.js', [], STAYCORE_PMS_VERSION, true);
        wp_localize_script('staycore-pms', 'StayCorePMS', [
            'root' => esc_url_raw(rest_url('staycore/v1/')),
            'nonce' => wp_create_nonce('wp_rest'),
            'today' => current_time('Y-m-d'),
            'settings' => get_option('staycore_pms_settings', []),
        ]);
    }

    public static function render(): void {
        if (!current_user_can('manage_staycore_pms') && !current_user_can('manage_options')) wp_die('Not allowed.');
        echo '<div class="wrap staycore-shell"><div id="staycore-app">';
        echo '<header class="staycore-head"><div><p class="eyebrow">PROPERTY OS</p><h1>Andaz Front Desk</h1></div><button class="button button-primary" id="sc-new-booking">+ Booking</button></header>';
        echo '<section class="staycore-kpis" id="sc-kpis"></section>';
        echo '<nav class="staycore-tabs"><button data-tab="rooms" class="active">Rooms</button><button data-tab="today">Today</button><button data-tab="stays">Stays</button><button data-tab="inventory">Inventory</button><button data-tab="integrations">Integrations</button></nav>';
        echo '<main id="sc-view"><div class="staycore-loading">Loading PMS…</div></main>';
        echo '<dialog id="sc-dialog"></dialog>';
        echo '</div></div>';
    }
}
