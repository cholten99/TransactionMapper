<?php

date_default_timezone_set("Europe/London");

// Clean testing log
function ClearLog() {
  $fp = fopen('TestLog.txt', 'w');
  TestLog("Restarted");
  fclose($fp);
}

// Log for testing
function TestLog($toLog) {
  $fp = fopen('TestLog.txt', 'a');
  $toLog = date("d/m/y H:s > ") . $toLog . "\n";
  fwrite($fp, $toLog);
  fclose($fp);
}

// Log array for testing
function TestLogArray($toLog) {
  ob_start();
  var_dump($toLog);
  $result = ob_get_clean();
  TestLog($result);
}

?>