<?php

// This will only add, update or delete data in the database
// For a quick demo I'm using a very nasty hack and exposing the data structure 
// to the front-end to simplify the back-end code a lot
// action={getAll | get | add | update | delete}
// table={table name}
// data={getAll: | get: id=<id> | add:[var=value] | update: [var=value] && id=<id> |  delete: id=<id>}

  // For logging
  include "logging.php";
  ClearLog();
  TestLogArray($_POST);

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

  if (($action == 'getById') || ($action == 'getByTransactionId') || ($action == 'update') || ($action == 'delete') || ($action == 'getNetworkString')) {
    $id = $_POST['id'];
    unset($_POST['id']); 
  }

  TestLog("Before!");

  if ($action == "getNetworkString") {
  
    TestLog("After!");

    $sql_string = "SELECT * FROM journeys WHERE id=" . $id;

    TestLog($sql_string);

    $result = $mysqli->query($sql_string);
    $row = $result->fetch_assoc();
    $actions_to_show = $row['actions_to_show'];
    $actions_to_show_array = explode(",", $actions_to_show);
    
    $result_string = "";
    
    foreach ($actions_to_show_array as $value) {
      $sql_string = "SELECT * FROM actions WHERE id=" . $value;

      TestLog($sql_string);  

      $result = $mysqli->query($sql_string);
      $row = $result->fetch_assoc();
      $action_name = $row['name'];
      $step_one_id = $row['step_one_id'];
      $step_two_id = $row['step_two_id'];
      
      $sql_string = "SELECT * FROM steps WHERE id=" . $step_one_id;

      TestLog($sql_string);

      $result = $mysqli->query($sql_string);
      $row = $result->fetch_assoc();
      $step_one = "\"" . $row['name'] . "\"";

      $sql_string = "SELECT * FROM steps WHERE id=" . $step_two_id;
      
      TestLog($sql_string);

      $result = $mysqli->query($sql_string);
      $row = $result->fetch_assoc();
      $step_two = "\"" . $row['name'] . "\"";

      $return_string .= $step_one . " -> " . $step_two . "[label=\"" . $action_name . "\"];";
    }
        
    TestLog($return_string);
  
    print $return_string;
    // Yes, I'm aware this is a hack
    exit(0);
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

  TestLog($sql_string);

  $result = $mysqli->query($sql_string);

  if ($action == "add") {
    print $mysqli->insert_id;
  }

  if ($action == 'getAll' || $action == 'getById' || $action == 'getByTransactionId') {
    $rows = array();
    while($row = $result->fetch_assoc()) {
      $rows[] = $row;
    }
    $output = json_encode($rows);

    TestLog($output);
    
    print $output;
  }

  $mysqli->close();

?>
