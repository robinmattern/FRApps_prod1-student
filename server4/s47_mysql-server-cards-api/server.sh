#!/bin/bash

      aPath="$( readlink -f $0 )"; aDir="$( dirname ${aPath} )"
      cd "${aDir}"; # echo -e "\n ${aDir}/../node_modules/.bin/json-server\n"
  if [ -f "../node_modules/.bin/nodemon" ]; then
  #   if [ -f "./data/uploads/Countries.xlsx" ]; then rm "./data/uploads/Countries.xlsx"; fi 
      chmod 777 ../node_modules/.bin/nodemon
      ../node_modules/.bin/nodemon --use_strict server.mjs
    else
      echo -e "\n * Remember to run npm install in the parent folder\n"
      fi