<?php
if (!defined('ABSPATH')) exit;

final class StayCore_REST {
    public static function boot(): void {
        add_action('rest_api_init', [__CLASS__, 'routes']);
    }

    public static function allowed(): bool {
        return current_user_can('manage_staycore_pms') || current_user_can('manage_options');
    }

    public static function routes(): void {
        register_rest_route('staycore/v1', '/dashboard', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'dashboard'],
            'permission_callback' => [__CLASS__, 'allowed'],
        ]);
        register_rest_route('staycore/v1', '/units', [
            [
                'methods' => 'GET',
                'callback' => [__CLASS__, 'units'],
                'permission_callback' => [__CLASS__, 'allowed'],
            ],
            [
                'methods' => 'POST',
                'callback' => [__CLASS__, 'create_unit'],
                'permission_callback' => [__CLASS__, 'allowed'],
            ],
        ]);
        register_rest_route('staycore/v1', '/reservations', [
            [
                'methods' => 'GET',
                'callback' => [__CLASS__, 'reservations'],
                'permission_callback' => [__CLASS__, 'allowed'],
            ],
            [
                'methods' => 'POST',
                'callback' => [__CLASS__, 'create_reservation'],
                'permission_callback' => [__CLASS__, 'allowed'],
            ],
        ]);
        register_rest_route('staycore/v1', '/reservations/(?P<id>\d+)/status', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'set_status'],
            'permission_callback' => [__CLASS__, 'allowed'],
        ]);
        register_rest_route('staycore/v1', '/integrations', [
            'methods' => 'GET',
            'callback' => fn() => rest_ensure_response(StayCore_Integrations::all()),
            'permission_callback' => [__CLASS__, 'allowed'],
        ]);
    }

    public static function dashboard(): WP_REST_Response {
        global $wpdb;
        $t = StayCore_DB::tables();
        $today = current_time('Y-m-d');
        $arrivals = (int)$wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$t['reservations']} WHERE DATE(check_in)=%s AND status IN ('confirmed','checked_in')", $today
        ));
        $departures = (int)$wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$t['reservations']} WHERE DATE(check_out)=%s AND status IN ('confirmed','checked_in')", $today
        ));
        $inhouse = (int)$wpdb->get_var(
            "SELECT COUNT(*) FROM {$t['reservations']} WHERE status='checked_in'"
        );
        $open_tasks = (int)$wpdb->get_var(
            "SELECT COUNT(*) FROM {$t['tasks']} WHERE status IN ('open','in_progress')"
        );
        $available = (int)$wpdb->get_var(
            "SELECT COUNT(*) FROM {$t['units']} WHERE status='available'"
        );

        return rest_ensure_response(compact('arrivals','departures','inhouse','open_tasks','available'));
    }

    public static function units(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $t = StayCore_DB::tables();
        $rows = $wpdb->get_results("SELECT * FROM {$t['units']} ORDER BY room_group, name", ARRAY_A);
        return rest_ensure_response($rows);
    }

    public static function create_unit(WP_REST_Request $request) {
        global $wpdb;
        $t = StayCore_DB::tables();
        $p = $request->get_json_params();
        $now = current_time('mysql');
        $data = [
            'name' => sanitize_text_field($p['name'] ?? ''),
            'type' => sanitize_key($p['type'] ?? 'bed'),
            'room_group' => sanitize_text_field($p['room_group'] ?? ''),
            'capacity' => max(1, absint($p['capacity'] ?? 1)),
            'base_rate' => (float)($p['base_rate'] ?? 0),
            'status' => sanitize_key($p['status'] ?? 'available'),
            'created_at' => $now,
            'updated_at' => $now,
        ];
        if (!$data['name']) return new WP_Error('missing_name', 'Unit name is required.', ['status'=>400]);
        $wpdb->insert($t['units'], $data);
        if (!$wpdb->insert_id) return new WP_Error('db_error', 'Could not create unit.', ['status'=>500]);
        StayCore_Integrations::emit('unit_created', ['id'=>(int)$wpdb->insert_id] + $data);
        return rest_ensure_response(['id'=>(int)$wpdb->insert_id] + $data);
    }

    public static function reservations(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $t = StayCore_DB::tables();
        $from = sanitize_text_field($request->get_param('from') ?: current_time('Y-m-d'));
        $to = sanitize_text_field($request->get_param('to') ?: gmdate('Y-m-d', strtotime($from . ' +30 days')));
        $sql = $wpdb->prepare(
            "SELECT r.*, CONCAT(g.first_name,' ',COALESCE(g.last_name,'')) guest_name, g.phone, u.name unit_name, u.room_group
             FROM {$t['reservations']} r
             LEFT JOIN {$t['guests']} g ON g.id=r.guest_id
             LEFT JOIN {$t['units']} u ON u.id=r.unit_id
             WHERE r.check_in < %s AND r.check_out >= %s
             ORDER BY r.check_in ASC",
             $to . ' 23:59:59', $from . ' 00:00:00'
        );
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }

    public static function create_reservation(WP_REST_Request $request) {
        global $wpdb;
        $t = StayCore_DB::tables();
        $p = apply_filters('staycore_pms_reservation_payload', $request->get_json_params());
        $now = current_time('mysql');

        $first = sanitize_text_field($p['first_name'] ?? '');
        $phone = sanitize_text_field($p['phone'] ?? '');
        $unit_id = absint($p['unit_id'] ?? 0);
        $check_in = sanitize_text_field($p['check_in'] ?? '');
        $check_out = sanitize_text_field($p['check_out'] ?? '');

        if (!$first || !$unit_id || !$check_in || !$check_out) {
            return new WP_Error('missing_fields', 'Guest name, unit, check-in and check-out are required.', ['status'=>400]);
        }
        if (strtotime($check_out) <= strtotime($check_in)) {
            return new WP_Error('bad_dates', 'Check-out must be after check-in.', ['status'=>400]);
        }

        $overlap = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$t['reservations']} WHERE unit_id=%d AND status NOT IN ('cancelled','no_show')
             AND check_in < %s AND check_out > %s LIMIT 1",
            $unit_id, $check_out, $check_in
        ));
        if ($overlap) return new WP_Error('unit_unavailable', 'This unit is already booked for those dates.', ['status'=>409]);

        $guest_id = 0;
        if ($phone) {
            $guest_id = (int)$wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$t['guests']} WHERE phone=%s ORDER BY id DESC LIMIT 1", $phone
            ));
        }
        if (!$guest_id) {
            $wpdb->insert($t['guests'], [
                'first_name'=>$first,
                'last_name'=>sanitize_text_field($p['last_name'] ?? ''),
                'phone'=>$phone,
                'email'=>sanitize_email($p['email'] ?? ''),
                'created_at'=>$now,
                'updated_at'=>$now,
            ]);
            $guest_id = (int)$wpdb->insert_id;
        }

        $data = [
            'guest_id'=>$guest_id,
            'unit_id'=>$unit_id,
            'source'=>sanitize_key($p['source'] ?? 'direct'),
            'external_ref'=>sanitize_text_field($p['external_ref'] ?? ''),
            'check_in'=>$check_in,
            'check_out'=>$check_out,
            'adults'=>max(1, absint($p['adults'] ?? 1)),
            'children'=>absint($p['children'] ?? 0),
            'status'=>sanitize_key($p['status'] ?? 'confirmed'),
            'total'=>(float)($p['total'] ?? 0),
            'currency'=>strtoupper(sanitize_text_field($p['currency'] ?? 'INR')),
            'notes'=>sanitize_textarea_field($p['notes'] ?? ''),
            'created_at'=>$now,
            'updated_at'=>$now,
        ];
        $wpdb->insert($t['reservations'], $data);
        if (!$wpdb->insert_id) return new WP_Error('db_error', 'Could not create reservation.', ['status'=>500]);
        $id = (int)$wpdb->insert_id;
        StayCore_Integrations::emit('reservation_created', ['id'=>$id] + $data);
        return rest_ensure_response(['id'=>$id] + $data);
    }

    public static function set_status(WP_REST_Request $request) {
        global $wpdb;
        $t = StayCore_DB::tables();
        $id = absint($request['id']);
        $status = sanitize_key(($request->get_json_params()['status'] ?? ''));
        $allowed = ['confirmed','checked_in','checked_out','cancelled','no_show'];
        if (!in_array($status, $allowed, true)) return new WP_Error('bad_status','Invalid reservation status.',['status'=>400]);
        $wpdb->update($t['reservations'], ['status'=>$status,'updated_at'=>current_time('mysql')], ['id'=>$id]);
        if (!$wpdb->rows_affected) return new WP_Error('not_found','Reservation was not updated.',['status'=>404]);
        StayCore_Integrations::emit('reservation_status_changed', ['id'=>$id,'status'=>$status]);
        return rest_ensure_response(['id'=>$id,'status'=>$status]);
    }
}
