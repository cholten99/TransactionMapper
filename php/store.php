<?php

// This will only add, update or delete data in the database
// For a quick demo I'm using a very nasty hack and exposing the data structure 
// to the front-end to simplify the back-end code a lot
// action={getall | get | add | update | delete}
// table={table name}
// data={getall: | get: id=<id> | add:[var=value] | update: [var=value] && id=<id> |  delete: id=<id>}

  $host = getenv("DB1_HOST");
  $user = getenv("DB1_USER");
  $pass = getenv("DB1_PASS");

  $mysqli = new mysqli($host, $user, $pass);
  $mysqli->select_db("transaction_mapper");

  if ($mysqli->connect_errno) {
    print "Failed to connect to MySQL: " . $mysqli->connect_error;
  }

  $table = $_POST['table'];
  unset($_POST['table'];
  $action = $_POST['action'];
  unset($_POST['action'];
  $id = 0;
  
  if (($action == 'getbyid') || ($action == 'getbytid') || ($action == 'update') || ($action == 'delete')) {
    $id = $_POST['id'];
    unset($_POST['id']; 
  }
  
  $sql_string = "";
  if ($action == 'getall') {
    $sql_string = "SELECT * FROM " . $table;
  } elseif ($action == 'getbyid') {
    $sql_string = "SELECT * FROM " . $table . " WHERE id=" . $id;
  } elseif ($action == 'getbytid') {
    $sql_string = "SELECT * FROM " . $table . " WHERE transaction_id=" . $id;
  } elseif ($action == 'add') {
    $columns = "";
    $values = "";
    foreach ($_POST as $key => $value) {
      $columns .= "'" . $key . "',";
      $values .= "'" . $value . "',";
    }
    $columns = rtrim($columns, ",");
    $values = rtrim($values, ",");
    $sql_string = "INSERT INTO " . $table . "(" . $columns . ") VALUES (" . $values . ")";
  } elseif ($action == 'update') {
    $sql_string = "UPDATE " . $table . "SET ";
    foreach ($_POST as $key => $value) {
      $sql_string .= "'" . $key . "'='" . $value . "',";
    }
    $sql_string = rtrim($sql_string, ",");
    $sql_string .= "WHERE id=" . $id;
  } else {
    $sql_string = "DELETE FROM " . $table . " WHERE id=" . $id;
  }

  $result = $mysqli->query($sql_string);

  if ($action == 'add') {
    print $mysqli->insert_id;
  }

  if (($action == 'getall' || $action == 'getbyid') || $action == 'getbytid')) {
    $rows = array();
    while($row = mysql_fetch_assoc($result)) {
      $rows[] = $row;
    }
    print json_encode($rows);
  }

  $mysqli->close();

?>
