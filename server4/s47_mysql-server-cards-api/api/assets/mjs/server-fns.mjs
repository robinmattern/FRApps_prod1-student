    import  mysql       from  'mysql2/promise';
//  import  express     from  'express';
    import  cors        from  'cors';
    import  fs          from  'fs' 

       var  bQuiet   =  false    // it's global in this module 
       var  aEnv     = '../../.env'

  async function  getData( pDB, aSQL ) {
       try {
       var [mRecs, mCols] =  await pDB.execute( aSQL );
       var  mColDefs      =  mCols.map( pRec => { return { Name: pRec.name, Type: pRec.type, Len: pRec.columnLength, Decs: pRec.decimals } } )
    return  mRecs
        } catch( pError ) {
            aSQL          =  aSQL.replace( /\n           /g, '\n     ').replace( /^[\n]+/, '' ).replace( /[ \n]+$/, '' )
            console.log(    `  *** Error: ${pError.message}\n${aSQL}\n` );
//  return  { "error":        '*** Error: ${pError.message}\n${aSQL}' };
    return  [ "error",        `*** Error: ${pError.message}\n${aSQL}` ] // .replace( /"/g, '\\"' ) ];
//  return `{ "error":        '*** Error: ${pError.message}\n${aSQL}' }`;
            }
       }
//     -------------------------------------------------------------

  function  sndRecs( pRes, mRecs, aSQL, aDatasetName ) {
            aSQL      =  aSQL.replace( /\n           /g, '\n     ').replace( /^[\n]+/, '' ).replace( /[ \n]+$/, '' )
       var  aRecords  =  aDatasetName ? aDatasetName.replace( /^\//, "" ) : 'records'
        if (String(mRecs[0]).match(/error/ )) { 
//          aJSON     =  JSON.stringify( { "error":      mRecs[1].replace( /[ \n]+$/, '' )     } )  
            aJSON     =                 `{ "error": \`${ mRecs[1].replace( /[ \n]+$/, '' ) }\` }`    
        } else {
        if (mRecs.length > 0) {
            console.log( `${aSQL || ''}\n  * ${ `${mRecs.length}`.padStart(3) } ${aRecords} found` );
       var  pRecs     =  mRecs; if (aDatasetName) { pRecs = {}; pRecs[aRecords] = mRecs }
       var  aJSON     =  fmtJSON( pRecs, aSQL )
        } else {
            console.log( `${aSQL || ''}\n ** No ${aRecords} found` );
       var  aJSON     =  JSON.stringify( {  "warning":   ` ** No ${aRecords} found` } )  
         }  }
                         sndJSON( pRes, aJSON, aRecords )
       }
//     -------------------------------------------------------------

  function  fmtJSON( pJSON, aSQL ) {
       try {
    return  JSON.stringify( pJSON )
        } catch( pError ) {
            console.log(   `${ aSQL ? aSQL + '\n' : '' }*** Error: ${pError.message}` );
//  return  JSON.stringify( { "error":  `*** Error: ${pError.message}`  }` )
    return                 `{ "error": \`*** Error: ${pError.message}\` }`
            }
       }
//     -------------------------------------------------------------

  function  sndJSON( pRes, aJSON, aRecords ) {
            pRes.setHeader( 'Content-Type', 'application/json' );
            pRes.send( aJSON )
            pRes.end();
        if (aJSON.match( /{ "error": /)) { return }    
        if (aRecords && !bQuiet) { console.log( `   JSON ${aRecords} sent\n` ) }
       }
//     -------------------------------------------------------------

  function  sayMsg( pReq, aMethod, aRoute ) {
//      if (pDB.Quiet) { return }  // wouldn't work anyway, cuz we're down two levels ?? 
        if (bQuiet) { return }

       if (!aRoute) { aRoute = aMethod; aMethod = pReq; pReq = null }
       var  aMsg      = `${ aMethod.toUpperCase() } Route, '${aRoute }`
        if (pReq) {
            pReq.args =  fmtArgs( pReq.query )  // save for ending sayMsg 
            console.log( `    ${aMsg}${pReq.args}', recieved` )
    return  aMsg
        } else {
            console.log( `    ${aMsg}', set` )
            }
       }
//     -------------------------------------------------------------

  function  chkArgs( pReq, pRes, pValidArgs ) {
//          pReq.args = fmtArgs( pReq.query )
       if (!pValidArgs) {
   return   pReq.query   // .(30318.01.1 RAM S.It.B {} ??)
       } else {
       var  mArgs     =  Object.keys( pReq.query ).map( aKey => { return [ aKey, pReq.query[ aKey ] ] } ), mErrArgs  = []
        if (mArgs.length > 0) {
            mErrArgs  =  mArgs.filter( chkArg )
        } else {
            mErrArgs  =  pValidArgs.required ? [ [ 'Required', 'yes' ] ] : [ ]
         }  }
        if (mErrArgs.length == 0) {
    return  pReq.query  // all or nothing
            }
            sndError( pRes, `Invalid Arguments`, mErrArgs.map( mArg => mArg.join('=') ) )
    return  null
//          ----------------------------------

  function  chkArg( mArg ) {
       var  rTestVals  =  pValidArgs[ mArg[0] ], bOk = false
        if (rTestVals !=  null) {
       var  bOk        =  rTestVals.test( mArg[1] )
            pReq.query[   mArg[0].toLowerCase() ] =  mArg[1]
            }
    return  bOk ? false : true
            }
//          ----------------------------------
       };
//     -------------------------------------------------------------

  function  fmtArgs( pArgs ) {
       var  mArgs =  Object.keys( pArgs ).map( aKey => { return [ aKey, pArgs[ aKey ] ] } )
       var  aArgs = (mArgs.length == 0) ? '' : '/' + mArgs.map( mArg => mArg.join('=') ).join()
    return  aArgs
       }
//     -------------------------------------------------------------

  function  sndHTML( pRes, aHTML, aURI ) {
            pRes.send( aHTML )
        if (aURI && !bQuiet) { console.log( `   HTML Page at ${aURI} sent\n` ) }
        }
//     -------------------------------------------------------------

  function  sndError( pRes, aMsg, mItems ) {

       var  aItems    =  mItems ? ( mItems.length > 0 ? `, '${ mItems.join() }'` : "") : ""

            aMsg      = `*** ${aMsg}${aItems}`
            pRes.send(  `<h3>${aMsg}.</h3>` )
       if (!bQuiet)  {   console.log(     `${aMsg}\n` ) }
       }
//     -------------------------------------------------------------

  function  setError( pApp, aMsg, s ) {

       pApp.use( '*', function( pReq, pRes ) {
            sndError(  pRes, `${aMsg}`, [ pReq.baseUrl ] )
            } )
       if (!bQuiet)  {   console.log( `    ${aMsg}${ s || '' }, set` ) } 
       }
//     -------------------------------------------------------------

  function init( pApp, pDB_Config, bQuiet_ ) {

//          pApp       =  express();

//          pDB        =        mysql.createConnection( pDB_Config_ ? pDB_Config_ : pDB_Config )

            pApp.use( cors( { origin: '*' } ) );

       var  aLocal_Host = setVar1( 'Host_Location', 'local' )                 // .(30831.01.1 RAM Beg base it on .env parameter)
        if (aLocal_Host == 'local')  { 
       var  aLocal_Host = setVar1( 'Local_Host', 'http://localhost:' )  
            aAPI_Host   = ''               
        } else {                                                              // .(30831.01.1 RAM End) 
       var  aRemote_Host= setVar1( 'Remote_Host', 'https:/iodd.com' )  
 //    var  aAPI_URL    = setVar1( 'API_URL', '/api2' )                
 //    var  aAPI_Host  = `${process.argv[1]}`.match( /^C:/ ) ? '' : aAPI_URL  //#.(30831.01.2) 
       var  aAPI_Host  =  setVar1( 'API_URL', '/api2' )                       // .(30831.01.2 RAM Don't count on OS paths) 
            }                                                                 // .(30831.01.3)
       //          console.log( `aAPI: ${aAPI}, argv0: '${process.argv[1]}'`);

            process.env = getEnv( `${__dirname}/.env` )             // .(30222.01.2 RAM Get it myself)

                          setVar2( 'DB_Host',     '45.32.219.12', 'host' ) 
                          setVar2( 'DB_User',     'nimdas'      , 'user' )
                          setVar2( 'DB_Password', 'FormR!1234'  , 'password' ) 
                          setVar1( 'Server_Port',  3000 ) 

//          pDB  =  await mysql.createPool( pDB_Config ? pDB_Config : pDB_Config )
       var  pDB        =  mysql.createPool( pDB_Config ? pDB_Config : pDB_Config )

//          pDB_.Quiet =  bQuiet_ ? bQuiet_ :  false 
//          bQuiet     =  bQuiet_ ? bQuiet_ :  bQuiet 
//     var  bQuiet     =  setVar1( 'Quiet', bQuiet_ ) 
//          bQuiet     =  setVar1( 'Quiet', bQuiet_ )         // It's global in this module 
            bQuiet     =  setVar1( 'Quiet', bQuiet_, true )   // Override value in .env 

//          pDB_.Quiet =  setVar1( 'quiet', bQuiet_ )         // these "singleton"s don't get new values ??? 
//          pDB_.API_Host = aAPI_Host  

//     return { pDB_: pDB, aAPI_Host_: aAPI_Host, bQuiet_: bQuiet }
       return { pDB_: pDB, aAPI_Host_: aAPI_Host }
//     return { pDB_ }

   function setVar2( aVar2, aVal, aVar1 ) {  // aVar2 in process.env, aVar1 in pDB_Config 
            aVar1 = aVar1 ? aVar1 : aVar2    // .toUpperCase(); // case is important 
            pDB_Config[aVar1] = typeof(process.env[aVar2]) != 'undefined' ? process.env[aVar2] : pDB_Config[aVar1] 
            pDB_Config[aVar1] = typeof(pDB_Config[aVar1])  != 'undefined' ? pDB_Config[aVar1]  : aVal || null
     return pDB_Config[aVar1]
            }
   function setVar1( aVar2, aVal, bSw) {  
        if (bSw) { return typeof(aVal) != 'undefined' ? aVal : process.env[aVar2] || '' }
     return typeof(process.env[aVar2]) != 'undefined' ? process.env[aVar2] : aVal || '' 
            }
       }     
//     -------------------------------------------------------------

    function start( pApp, nPort, aAPI_Host ) {     // must be last

       var  nPort      =  nPort ? nPort : process.env.Server_Port                                   // .(30312.02.1 RAM Set nPort for FRApps/server3/s36_mysql-data-api )
            
            pApp.get(    '/favicon.*', function( pReq, pRes ) {
                          pRes.sendFile( `${__dirname}/${pReq.url}` ) } )                           // .(30318.01.1 RAM Or else it's a bad route)

            setError( pApp, 'Bad Route', 's' ) // Other Uses?

            pApp.listen( nPort );                                                                   // .(30213.02.2 RAM Change real port from 3000 to 3002).(30213.02.4)
        if (aAPI_Host == '') {                                                                      // .(30214.03.11)
            console.log( `\n    Server is running at: http://localhost:${nPort}` )                  // .(30213.02.1 Change port from 3000 to 3002).(30213.02.5)
        } else {                                                                                    // .(30214.03.12 Beg)
//          console.log( `\n    Server is running at: https://IODD.com${aAPI_Host} -> port:${nPort}` )
            console.log( `\n    Server is running at: ${ aRemote_Host}${aAPI_Host} -> port:${nPort}` )
            }                                                                                       // .(30214.03.12 End)
            console.log(   `    Server is running in: ${ process.argv[1] }\n` )                     // .(30214.03.10 RAM Display root dir)
       }
//     -------------------------------------------------------------

      var   aURI        =  import.meta.url
      var __filename    =  aURI.replace( /^.+\//, "" )
      var __dirname     =  aURI.replace( `/${__filename}`, "" ).replace( "file:///", "" )

//          dotenv.config();                                                                        // .(30222.01.1 RAM No Workie in VSCode debugger)
            process.env =  getEnv( `${__dirname}/${aEnv}` )                                         // .(30222.01.2 RAM Get it myself)
//          console.log( Object.keys(process.env).filter( aVar => aVar.match( /^DB/ ) ) )

  function  getEnv( aFile, bNewOnly ) {                                                             // .(30222.01.3 RAM Beg Write getEnv)).(30320.04.2 RAM Don't reurn existing values)
       if (!fs.existsSync( aFile )) { return process.env }                                          // .(30319.01.1 RAM Do nothing if .env not found)
       var  mVars  =  fs.readFileSync( aFile, 'ASCII' ).split(/[\r\n]/), pVars = { }
            mVars.forEach( aVar => { if (aVar.replace( /^ +/, "" ) > "" && aVar.match( /^ *#/ ) == null ) { 
       var  aKey = aVar.replace( /=.*/,  '' ).replace( /[ '"]/g,  '' );                             // .(30320.05.1 RAM No Quotes or spaces)
       var  aVal = aVar.replace( /.+?=/, '' ).replace( /^[ '"]*/, '' ).replace( /[ '"]*$/, '' );    // .(30320.05.1 RAM No leading Quotes or spaces)
       var  bNum = aVal.match( /^ *([0-9]+|true|false) *$/i ) != null        
//          pVars[aKey] = bNum ?  aVal.replace(/true/, '1').replace(/false/, '0') * 1 : aVal } } )
            pVars[aKey] = bNum ? (aVal.toLowerCase() == 'false' ? false : (aVal.toLowerCase() == 'true' ? true : aVal * 1 )) : aVal } } )
     return bNewOnly ? pVars : { ...process.env,  ...pVars }                                        // .(30319.01.2 RAM Add to existing env vars).(30320.04.2)
            }                                                                                       // .(30222.01.3 RAM End)
//     -------------------------------------------------------------

   export { getData, sndRecs,  fmtJSON,  sndJSON, chkArgs, fmtArgs }
   export { sndHTML, sndError, setError, sayMsg,  init,    start   }

