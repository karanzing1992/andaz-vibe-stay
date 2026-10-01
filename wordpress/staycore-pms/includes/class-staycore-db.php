<?php
if (!defined('ABSPATH')) exit;

final class StayCore_DB {
    public static function tables(): array {
        global $wpdb;
        return [
            'units'        => $wpdb->prefix . 'staycore_units',
            'guests'       => $wpdb->prefix . 'staycore_guests',
            'reservations' => $wpdb->prefix . 'staycore_reservations',
            'payments'     => $wpdb->prefix . 'staycore_payments',
            'tasks'        => $wpdb->prefix . 'staycore_tasks',
        ];
    }

    public static function activate(): void {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $t = self::tables();
        $charset = $wpdb->get_charset_collate();

        dbDelta("CREATE TABLE {$t['units']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(120) NOT NULL,
            type VARCHAR(40) NOT NULL DEFAULT 'bed',
            room_group VARCHAR(120) NULL,
            capacity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
            base_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
            status VARCHAR(30) NOT NULL DEFAULT 'available',
            meta LONGTEXT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY status (status),
            KEY room_group (room_group)
        ) $charset;");

        dbDelta("CREATE TABLE {$t['guests']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            first_name VARCHAR(120) NOT NULL,
            last_name VARCHAR(120) NULL,
            phone VARCHAR(40) NULL,
            email VARCHAR(190) NULL,
            nationality VARCHAR(100) NULL,
            id_type VARCHAR(60) NULL,
            id_number VARCHAR(120) NULL,
            notes TEXT NULL,
            meta LONGTEXT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY phone (phone),
            KEY email (email)
        ) $charset;");

        dbDelta("CREATE TABLE {$t['reservations']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            guest_id BIGINT UNSIGNED NOT NULL,
            unit_id BIGINT UNSIGNED NOT NULL,
            source VARCHAR(60) NOT NULL DEFAULT 'direct',
            external_ref VARCHAR(190) NULL,
            check_in DATETIME NOT NULL,
            check_out DATETIME NOT NULL,
            adults SMALLINT UNSIGNED NOT NULL DEFAULT 1,
            children SMALLINT UNSIGNED NOT NULL DEFAULT 0,
            status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
            total DECIMAL(12,2) NOT NULL DEFAULT 0,
            currency CHAR(3) NOT NULL DEFAULT 'INR',
            notes TEXT NULL,
            meta LONGTEXT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY stay_dates (check_in, check_out),
            KEY status (status),
            KEY guest_id (guest_id),
            KEY unit_id (unit_id),
            KEY external_ref (external_ref)
        ) $charset;");

        dbDelta("CREATE TABLE {$t['payments']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            reservation_id BIGINT UNSIGNED NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            currency CHAR(3) NOT NULL DEFAULT 'INR',
            method VARCHAR(60) NOT NULL DEFAULT 'cash',
            status VARCHAR(30) NOT NULL DEFAULT 'captured',
            external_ref VARCHAR(190) NULL,
            meta LONGTEXT NULL,
            paid_at DATETIME NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY reservation_id (reservation_id),
            KEY external_ref (external_ref)
        ) $charset;");

        dbDelta("CREATE TABLE {$t['tasks']} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            unit_id BIGINT UNSIGNED NULL,
            reservation_id BIGINT UNSIGNED NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'housekeeping',
            title VARCHAR(190) NOT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'open',
            priority VARCHAR(20) NOT NULL DEFAULT 'normal',
            assigned_user_id BIGINT UNSIGNED NULL,
            due_at DATETIME NULL,
            notes TEXT NULL,
            meta LONGTEXT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY status (status),
            KEY type (type),
            KEY due_at (due_at)
        ) $charset;");

        if (!get_option('staycore_pms_settings')) {
            add_option('staycore_pms_settings', [
                'property_name' => 'Andaz Vibe Stay - Arambol, Goa',
                'currency' => 'INR',
                'timezone' => wp_timezone_string() ?: 'Asia/Kolkata',
                'check_in_time' => '13:00',
                'check_out_time' => '11:00',
            ]);
        }

        $admin = get_role('administrator');
        if ($admin) $admin->add_cap('manage_staycore_pms');
        update_option('staycore_pms_db_version', STAYCORE_PMS_VERSION);
    }
}
