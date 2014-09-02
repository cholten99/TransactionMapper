<?php

// This will only add, update or delete data in the database

  $host = getenv("DB1_HOST");
  $user = getenv("DB1_USER");
  $pass = getenv("DB1_PASS");

  $mysqli = new mysqli($host, $user, $pass);
  $mysqli->select_db("plldb");

  if ($mysqli->connect_errno) {
    print "Failed to connect to MySQL: " . $mysqli->connect_error;
  }

  $id = $_SESSION['id'];
  $fetch_string = "SELECT name,location FROM users WHERE (id='" . $id . "')";
  $result = $mysqli->query($fetch_string);
  $row = $result->fetch_assoc();
  $name = $row['name'];
  $first_name = substr($name, 0, strpos($name, " "));
  $mysqli->close();

?>
