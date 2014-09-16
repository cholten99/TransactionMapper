<?php

// This will only add, update or delete data in the database
// For a quick demo I'm using a very nasty hack and exposing the data structure 
// to the front-end to simplify the back-end code a lot
// action={getAll | get | add | update | delete}
// table={table name}
// data={getAll: | get: id=<id> | add:[var=value] | update: [var=value] && id=<id> |  delete: id=<id>}

  // For logging
  include "logging.php";
//  ClearLog();
//  TestLogArray($_POST);

  $host = getenv("DB1_HOST");
  $user = getenv("DB1_USER");
  $pass = getenv("DB1_PASS");

  $mysqli = new mysqli($host, $user, $pass);
  $mysqli->select_db("transaction_mapper");

  if ($mysqli->connect_errno) {
    print "Failed to connect to MySQL: " . $mysqli->connect_error;
  }

  $table = $_POST['table'];
  unset($_POST['table']);
  $action = $_POST['action'];
  unset($_POST['action']);
  $id = 0;

  if (($action == 'getById') || ($action == 'getByTransactionId') || ($action == 'update') || ($action == 'delete')) {
    $id = $_POST['id'];
    unset($_POST['id']); 
  }

  $sql_string = "";
  if ($action == "getAll") {
    $sql_string = "SELECT * FROM " . $table . " ORDER BY name";
  } elseif ($action == "getById") {
    $sql_string = "SELECT * FROM " . $table . " WHERE id=" . $id . " ORDER BY name";
  } elseif ($action == "getByTransactionId") {
    $sql_string = "SELECT * FROM " . $table . " WHERE transaction_id=" . $id . " ORDER BY name";
  } elseif ($action == "add") {
    $columns = "";
    $values = "";
    foreach ($_POST as $key => $value) {
      $columns .= $key . ",";
      $values .= "'" . $value . "',";
    }
    $columns = rtrim($columns, ",");
    $values = rtrim($values, ",");
    $sql_string = "INSERT INTO " . $table . "(" . $columns . ") VALUES (" . $values . ")";
  } elseif ($action == "update") {
    $sql_string = "UPDATE " . $table . " SET ";
    foreach ($_POST as $key => $value) {
      $sql_string .= $key . "='" . $value . "',";
    }
    $sql_string = rtrim($sql_string, ",");
    $sql_string .= " WHERE id=" . $id;
  } else {
    $sql_string = "DELETE FROM " . $table . " WHERE id=" . $id;
  }

  $result = $mysqli->query($sql_string);

  if ($action == "add") {
    print $mysqli->insert_id;
  }

  if ($action == 'getAll' || $action == 'getById' || $action == 'getByTransactionId') {
    $rows = array();
    while($row = $result->fetch_assoc()) {
      $rows[] = $row;
    }
    print json_encode($rows);
  }

  $mysqli->close();

?>
