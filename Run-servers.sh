#!/bin/bash

#   git  clone https://github.com/robinmattern/FRApps_prod1-student.git  FRApps
#   cd   FRApps

    aApps=,$1; if [ "${aApps}" == ","     ]; then aApps=",22,33,44"; fi
    nDoit=2;   if [ "$2" == "installonly" ]; then nDoit=1; fi
               if [ "$2" == "withInstall" ]; then nDoit=3; fi
                                                                      aOS="unix"
    xBASH="bash"; if [ -f "C:/Program Files/Git/git-bash.exe" ]; then aOS="win"; xBASH="C:/Program Files/Git/git-bash.exe"; fi
                  if [ "${OSTYPE:0:6}" == "darwin"            ]; then aOS="mac"; xBASH="open -a Terminal "; fi  # open -a Terminal
#   echo "nDoit: ${nDoit}, aOS: ${aOS}, xBASH: '${xBASH}'"; exit

           aDirPath="$( git status 2>&1 | awk '/fatal: detected/ { sub( /.+repository at /, ""); print }' )"
   if [ "${aDirPath}" != "" ]; then git config --global --add safe.directory "${aDirPath//\'/}"; fi

   if [ "${aOS}"   != "win" ]; then find "$(PWD)" -type f -name "*.sh" -exec chmod 755  {} \;  # add execute permissions to unix .sh scripts
   fi
# -----------------------------------------------------------------------------

   echo ""
   git  checkout  b3.3_my-javascript-custom-apps

# -----------------------------------------------------------------------------

function addModules() {
   if [ ! -d server$1/node_modules ] || [ "${bInstall}" == "1" ]; then
   echo  -e "\n\n  Installing Server$1 modules"
   echo "-------------------------------------------------------------"
   cd   server$1; npm install;  cd ..;
   fi
   }
# -----------------------------------------------------------------------------

function runServer() {
   nApp=$1
#  echo -e "\n  Starting Server${nApp:0:1}/s${nApp}"
#  echo "-------------------------------------------------------------"
#  echo "cd server${nApp:0:1}/s${nApp}*; bash -i -login ./run_server.sh"; # return
         cd server${nApp:0:1}/s${nApp}*; #echo -e "\n  cd $(pwd);\n \"${xBASH}\" ./run_server.sh"; # exit
if [ "${OSTYPE:0:6}" != "darwin" ]; then
#  echo  "#\"${xBASH}\" ./run-server.sh"; exit 
            "${xBASH}" ./run-server.sh &          #  bash -login ./run_server.sh
   else
#  echo  "# ${xBASH}  ./run-server.sh";   exit 
            ${xBASH}  ./run_server.sh             #  no quotes, and no & to run in background #.(30919.01.1 RAM Does this run in Windows? No)
   fi
   cd   ../../;
   }
# -----------------------------------------------------------------------------

if [ "${nDoit}" == "1" ] || [ "${nDoit}" == "3" ]; then bInstall=1; else bInstall=0; fi

if [ "${aApps/,2/}"  != "${aApps}" ]; then addModules 2; fi
if [ "${aApps/,3/}"  != "${aApps}" ]; then addModules 3; fi
if [ "${aApps/,4/}"  != "${aApps}" ]; then addModules 4; fi

if [ "${nDoit}" == "2" ] || [ "${nDoit}" == "3" ]; then

if [ "${aApps/,22/}" != "${aApps}" ]; then runServer 22; fi
if [ "${aApps/,33/}" != "${aApps}" ]; then runServer 33; fi
if [ "${aApps/,44/}" != "${aApps}" ]; then runServer 44; fi

#  echo -e "\n  Servers will start in a minute."
   fi
# -----------------------------------------------------------------------------

#  echo ""
#  git  checkout  -f  master

#  code FRApps.code-workspace
