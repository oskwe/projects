<?php
include_once __DIR__ . '/../../db.php';

$id = $_POST['id'] ?? null;
$last_name = $_POST['last_name'] ?? '';
$first_name = $_POST['first_name'] ?? '';
$middle_name = $_POST['middle_name'] ?? '';
$post = $_POST['post'] ?? '';
$passport_series = $_POST['passport_series'] ?? '';
$passport_number = $_POST['passport_number'] ?? '';
$passport_issued_by = $_POST['passport_issued_by'] ?? '';
$passport_date_of_issue = $_POST['passport_date_of_issue'] ?? '';

if ($id && $last_name && $first_name && $post && $passport_series && $passport_number && $passport_issued_by && $passport_date_of_issue) {
    executeQuery("
        UPDATE employees 
        SET last_name = ?, first_name = ?, middle_name = ?, post = ?, passport_series = ?, passport_number = ?, passport_issued_by = ?, passport_date_of_issue = ?
        WHERE id = ?
    ", [$last_name, $first_name, $middle_name, $post, $passport_series, $passport_number, $passport_issued_by, $passport_date_of_issue, $id]);
}

header("Location: employees_view.php");
exit;
