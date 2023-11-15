
   var  express          =  require('express');
// var  bodyParser       =  require( 'body-parser' )
   var  fileUpload       =  require( 'express-fileupload' );
// var  killPort         =  require( 'kill-port' );

   var  dotenv           =  require( 'dotenv' );
   var  cors             =  require( 'cors' )
   var  fs               =  require( 'fs'   );

   var  pAccessRoutes    =  require( './Access-Server.js' );
   var  pExcelRoutes     =  require( './Excel-Server.js'  );

   var  { getExcel_Rows, pCfg   } =  require( "./getExcel_Rows.js" )
   var  { fmtClientMsg,  pExcel } =  require( "./getExcel_Rows.js" )
   var  { makExcel_FileBuffer   } =  require( "./getExcel_Rows.js" )

// -------  ------------------------------------------------------------

        dotenv.config( { path: `${__dirname}/../.env` } )

        nDefault_Port    =  50133  // default             

        pCfg.Server.Port =  process.argv[2]  ? process.argv[2]
                         : (process.env.PORT ? process.env.PORT 
                         : (pCfg.Server.Port ? pCfg.Server.Port 
                         :  nDefault_Port ) )

// -------  ------------------------------------------------------------

   var  pApp             =  express( );
//      pApp.use( bodyParser.urlencoded({ extended: true }) );
        pApp.use( fileUpload( ) );
        pApp.use( cors( { origin: '*' } ) );

        pApp.use( '/access/world', pAccessRoutes )  
        pApp.use( '/excel',        pExcelRoutes( pApp ) )

// -------  ------------------------------------------------------------

        pApp.post( '/upload', function( req, res ) {

       if (!req.files || Object.keys( req.files ).length === 0) {  // req.files provided by Express 

            res.send( fmtClientMsg( "No files were uploaded.", 2 ) );
            }
       var  pFile       =  req.files[ pCfg.Client.FormFld ]          // name of the input field (i.e. "sampleFile")
            pCfg.Client.ExcelName = pFile.name
       var  aExcelFile  =  pCfg.Client.setExcelFile( ) 

            pFile.mv( aExcelFile, function( pErr ) {       // req.files[].mv provided by Express
        if (pErr) {
        var aMsg2       = (pErr.code == "EBUSY") ? "\\nIt is probably open in Excel." : "" 
            res.send( fmtClientMsg( `Unable to upload the file, '${pFile.name}'.`, 1, aMsg2 ) )
            }
            res.send( fmtClientMsg( `The XSLX file, '${pFile.name}', has been uploaded!`, 2 ) )
            } ); // eof rename uploaded file

       }); // eof POST /upload
// -------  ------------------------------------------------------------

        pApp.get( '/download/json_xx', function( req, res ) {
//   pRouter.get( '/download/json', function( req, res ) {

            pCfg.Client.ExcelName   = "Countries.Excel"
            pCfg.Client.UploadPath  =  pCfg.Client.UploadPath
            pCfg.Client.setExcelFile( ) 

       var  mRows    =  getExcel_Rows( pCfg.Client.ExcelFile ) // "Countries.Excel" )

        if (mRows.length == 0) {

            res.send( fmtClientMsg( `Unable to extract json data from the file, '${pCfg.Client.ExcelName}'!` ) )

        } else {

       var  aExcelSheet  =  pCfg.Client.ExcelSheet    // aka  aDatasetName                                                                   // .(30918.02.4)
//     var  aExcelSheet  = (aExcelSheet == "Data") ?  pCfg.Client.ExcelName.replace( /.Excel/i, "" ) : aExcelSheet    //#.(30918.02.5)
        if (aExcelSheet == "Data") { aExcelSheet   =  pCfg.Client.ExcelName.replace( /.Excel/i, "" ).toLowerCase() }  // .(30918.02.5)
       var  pJSON       = { };                        // .(30918.02.6)
            pJSON[ aExcelSheet ] = mRows              // .(30918.02.7 RAM Can't do this: { aExcelSheet : mRows } )
            res.status(200).json( pJSON )             // .(30918.02.8)
            }
        }); // eof GET '/download/json'
// -------  ------------------------------------------------------------

       pApp.get( '/download/countries_xx', function( req, res ) {

            pCfg.Client.setExcelFile( ) 
            
       var  mRows     = getExcel_Rows( pCfg.Client.ExcelFile ) // "Countries.Excel" )

        if (mRows.length == 0) {

        res.send( fmtClientMsg( `Unable to download file, '${pCfg.Client.ExcelName}'!` ) );

        } else {
/*                       pExcel.set_fs( fs );

       var  pSheet    =  pExcel.utils.json_to_sheet( mRows );
       var  pWorkBook =  pExcel.utils.book_new();
                         pExcel.utils.book_append_sheet( pWorkBook, pSheet, "Data" );
       var  pBuffer   =  pExcel.write( pWorkBook, { type: "buffer", bookType: "xlsx" } );  /* generate buffer *//*
 */                         
       var  pBuffer   =  makExcel_FileBuffer( mRows, "Data" ) 
            res.attachment(  pCfg.Client.ExcelName );  /* set header to download file name */
            res.status( 200 ).end( pBuffer );          /* respond with file data */
            }
        }); // eof GET '/download/counties'
// -------  ------------------------------------------------------------

  async  function  startServer( nPort, aMsg ) {
       var  nOK  = 1 
/*      
       try {
//          await  killPort( 3000 ).then( ( ) => {
       var  pOK =  await  killPort( 3000 );
            nOK =  pOK.code == 1 ? 1 : 2  
        if (nOK == 2) {       
            console.log( `\n  Process with Port, ${nPort}, killed successfully` ); }
//    } ).catch(   pErr => {    
        } catch(   pErr ) {
            nOK = (pErr instanceof PortNotListeningError) 
       if (!nOK) {   
            console.log( `\n* Error killing port ${nPort}.\n` );
            } } 
//          } } )  
*/       
        if (nOK > 0) {   
            console.log(  `${ (nOK == 1 ? "\n" : "" ) + "  " + aMsg }\n`.replace( /{Port}/, nPort )  )
//          console.log( "Client App is located at file:///Users/robinm/Public/Repos/FRApps_/dev03-student/client2/c23_javascript-express-Excel-app/src/index.html")

            pApp.listen(  nPort );
            }
         }; // eof startServer    
// -------  ------------------------------------------------------------

            startServer(  pCfg.Server.Port, 'Server API is listening on http://localhost:{Port}/download/json' )

    var pConfig =
         { port:  pCfg.Client.Port
//       , root: '/Users/robinm/Public/Repos/FRApps_/dev03-student/client2/c23_javascript-express-Excel-app/app/'
//       , root:                            `${__dirname}/../../../client2/c23_javascript-express-Excel-app/app/`
//       , root:                            `${__dirname}/../../../client2/c24_javascript-mysql-server-app/app/`
//       , root:                                         '../../../client2/c23_javascript-express-Excel-app/app/'
         , root:  pCfg.Client.AppDir
         , open: [ 'index.html' ]
//       , host: '0.0.0.0'
//       , browser: 'firefox'
//       , https: false
           }

//   new fiveServer().start( { open: false } )
//   new liveServer().start( pConfig )

// --------------------------------------------------------------------
