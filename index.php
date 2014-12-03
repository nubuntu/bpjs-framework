<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
session_start();
include ("config.php");
include ("framework.php");
$base = NC\base::getInstance($config);
$base->run();