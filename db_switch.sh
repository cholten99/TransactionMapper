#!/bin/bash
if [ "$1" == "dev" ]
then
  cp -r phpmyadmin/config.inc.php_dev phpmyadmin/config.inc.php
  echo "Set up for dev"
elif [ "$1" == "prod" ]
then
  cp -r phpmyadmin/config.inc.php_prod phpmyadmin/config.inc.php
  echo "Set up for prod"
else
  echo "Usage ./db_switch.sh [dev | prod]"
fi