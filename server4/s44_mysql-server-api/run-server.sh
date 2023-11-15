#!/bin/bash
#     Start Server with these parameters:

      nPort=50144
      aModule="nodemon"
#     aStartCmd="../node_modules/.bin/${aModule}  -p ${nPort} -r api/routes.json --watch data/db.json"  # Server  s22*
#     aStartCmd="../node_modules/.bin/${aModule} --use_strict    api/server.js  ${nPort}"               # Server  s33*
      aStartCmd="../node_modules/.bin/${aModule} --use_strict    api/server.mjs ${nPort}"               # Server  s44* and s33*

      aPath="$( readlink -f $0 )";  aDir="$( dirname ${aPath} )";
      cd "${aDir}";  # echo -e "\n  aDir: '${aDir}'"; ls -l ../node_modules/.bin; exit

# -----------------------------------------------------------------------------

function killPort() {
        nPort=$1

if [ "${OSTYPE:0:6}" == "darwin" ]; then
        nPID=$( lsof -i tcp:${nPort} | awk 'NR == 2 { print $2 }' )
  else
        nWID=$( netstat -ano | awk '/TCP.+:'${nPort}'/ { print $5; exit }' )
if [ "${nWID}" == "" ]; then return; fi
        nPID=$( ps -W | awk '/ '${nWID}' / { print $1 }' )
   fi
if [ "${nPID}" == "" ]; then return; fi
        aErr=$( kill ${nPID} 2>&1 ); if [ "${aErr}" != "" ]; then aErr=" failed! Try to end process (PID ${nPID}) manually."; else aErr="."; fi
        echo "  Killing Port ${nPort}${aErr}"; if [ "${aErr}" != "." ]; then read -p ""; exit; fi

        } # eof killPort
# -----------------------------------------------------------------------------

function runServer() {
        nPort=$1

  if [      -f "../node_modules/.bin/${aModule}" ]; then
      chmod 777 ../node_modules/.bin/${aModule}

      echo -e "\n  Starting Server in ${aDir/*FRApps/}\n-------------------------------------------------------------------------------------"

      killPort ${nPort}
      ${aStartCmd}

    else
      echo -e "\n* Need to run npm install in the parent folder."
      read -p "  Do it now? [y/n]: " aYorN
      if [[ ${aYorN} =~ ^[yY]$ ]]; then
          cd ..
          echo ""
          npm install
          echo ""
          read -p "  Press Enter to exit";
          fi
      fi

        } # eof runServer
# -----------------------------------------------------------------------------

        runServer ${nPort}


