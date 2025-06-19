<?php
namespace CM\A_Test;

if (!defined('ABSPATH')) {
    exit;
}

require_once(__DIR__ . '/config.php');

function init() {
    Config::init();
    add_action('init', __NAMESPACE__ . '\register_block');
}

function register_block() {
    register_block_type(__DIR__);
}

init();