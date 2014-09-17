<?php

    $fp = fopen('TestLog.txt', 'w');
    fwrite($fp, "Biggins");
    fclose($fp);

$LOGGING = true;

date_default_timezone_set("Europe/London");

// Clean testing log
function ClearLog() {

    $fp = fopen('TestLog.txt', 'w');
    fwrite($fp, "Beggins");
    fclose($fp);

  if ($LOGGING) {
    $fp = fopen('TestLog.txt', 'w');
    TestLog("Restarted");
    fclose($fp);
  }
}

// Log for testing
function TestLog($toLog) {
  if ($LOGGING) {
    $fp = fopen('TestLog.txt', 'a');
    $toLog = date("d/m/y H:s > ") . $toLog . "\n";
    fwrite($fp, $toLog);
    fclose($fp);
  }
}

// Log array for testing
function TestLogArray($toLog) {
  if ($LOGGING) {
    ob_start();
    var_dump($toLog);
    $result = ob_get_clean();
    TestLog($result);
  }
}

?>