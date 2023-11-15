
   var  express          =  require( 'express' );
// var  bodyParser       =  require( 'body-parser' )
// var  dotenv           =  require( 'dotenv' );
   var  fs               =  require( 'fs'   );


   var  { getExcel_Rows, pCfg } =  require( './getExcel_Rows.js' )
   var  { fmtClientMsg
        , makExcel_FileBuffer } =  require( './getExcel_Rows.js' )

// -------  ------------------------------------------------------------

     if ( fs.existsSync( pCfg.Client.ExcelFile ) ) {  // Erase Countries.Excel if exists
          fs.unlinkSync( pCfg.Client.ExcelFile )
          };
// -------  ------------------------------------------------------------






// -------  ------------------------------------------------------------

       var  pRouter          =  express.Router();

     module.exports = function pExcelRoutes( pApp ) {

            pApp.use(    '/download/countries', getDownloadCountries_Handler); // /download/countries
            pApp.use(    '/download/json',      getDownloadJSON_Handler     ); // /download/json

            pRouter.get( '/countries',          getDownloadJSON_Handler     ); // /excel/countries
            pRouter.get( '/world/cities',       getWorldCities_Handler      ); // /excel/world/cities
            pRouter.get( '/world/countries',    getWorldCountries_Handler   ); // /excel/world/countries

    return  pRouter;
         }; // eom module.exports
// -------  ------------------------------------------------------------

  function  getDownloadJSON_Handler( req, res ) {               // '/download/json'
//  pRouter.get( '/download/json', function( req, res ) {

            pCfg.Client.ExcelName   = "Countries.xlsx"          // why is it executed twice
            pCfg.Client.UploadPath  =  pCfg.Client.UploadPath
            pCfg.Client.setExcelFile( )

       var  mRows    =  getExcel_Rows( pCfg.Client.ExcelFile )  // "Countries.xlsx" )

        if (mRows.length == 0) {

            res.send( fmtClientMsg( `Unable to extract json data from the file, '${pCfg.Client.ExcelName}'!` ) )

        } else {
       var  aExcelSheet  =  pCfg.Client.ExcelSheet              // aka aDatasetName                                  // .(30918.02.4)
//     var  aExcelSheet  = (aExcelSheet == "Data") ?  pCfg.Client.ExcelName.replace( /.xlsx/i, "" ) : aExcelSheet    //#.(30918.02.5)
        if (aExcelSheet == "Data") { aExcelSheet   =  pCfg.Client.ExcelName.replace( /.xlsx/i, "" ).toLowerCase() }  // .(30918.02.5)
       var  pJSON        = { };                                 // .(30918.02.6)
            pJSON[ aExcelSheet ] = mRows                        // .(30918.02.7 RAM Can't do this: { aExcelSheet : mRows } )

            res.status( 200 ).json( pJSON )                     // .(30918.02.8)
            }
         }; // eof DownloadJSON_Handler'
// -------  ------------------------------------------------------------

  function  getDownloadCountries_Handler( req, res ) {              // '/download/countries

       var  aExcelName   =  pCfg.Client.ExcelName
       var  aExcelFile   =  pCfg.Client.setExcelFile( )

       var  mRows        =  getExcel_Rows( aExcelFile ) // "Countries.xlsx" )

        if (mRows.length == 0) {

            res.send( fmtClientMsg( `Unable to download file, '${aExcelName}'!` ) );

        } else {

       var  pBuffer      =  makExcel_FileBuffer( mRows, "Data" )
            res.attachment( aExcelName );           /* set header to download file name */

            res.status( 200 ).end( pBuffer );       /* respond with file data */
            }
        }; // eof getDownloadCountries_Handler'
// -------  ------------------------------------------------------------

  function  getWorldCountries_Handler( req, res ) {    // '/excel/world/countries'

            pCfg.Client.ExcelName   = "World.xlsx"
            pCfg.Client.UploadPath  =  pCfg.Client.DataPath
            pCfg.Client.setExcelFile( )

       var  mRows    =  getExcel_Rows( pCfg.Client.ExcelFile, "Countries" )

        if (mRows.length == 0) {
            res.send(   fmtClientMsg( `Unable to extract Countries data from the file, ${pCfg.Client.ExcelName}!` ) )
        } else {
            res.status( 200 ).json( {  countries: mRows } )
            }
         }; // eof GET '/excel/world/countries'
// -------  ------------------------------------------------------------

  function  getWorldCities_Handler( req, res ) { // '/excel/world/cities'

            pCfg.Client.ExcelName   = "World.xlsx"
            pCfg.Client.UploadPath  =  pCfg.Client.DataPath
            pCfg.Client.setExcelFile( )

        if (req.query) {                                                                                // .(31107.02.5 RAM Beg)
            console.log( " * ignoring URL Query, '${req.query}, for Excel" )
            }                                                                                           // .(31107.02.5 RAM End)
       var  mRows    =  getExcel_Rows( pCfg.Client.ExcelFile, "Cities" )

        if (mRows.length == 0) {
            res.send(   fmtClientMsg( `Unable to extract Cities data from the file, ${pCfg.Client.ExcelName}!` ) )
        } else {
            res.status( 200 ).json( { cities: mRows } )
            }
         }; // eof GET '/excel/world/cities'
// -------  ------------------------------------------------------------
/*
     module.exports = ( pApp ) => {

            pApp.use(    '/download/countries', getDownloadCountries_Handler); // /download/countries
            pApp.use(    '/download/json',      getDownloadJSON_Handler     ); // /download/json

            pRouter.get( '/countries',          getDownloadJSON_Handler     ); // /excel/countries
            pRouter.get( '/world/cities',       getWorldCities_Handler      ); // /excel/world/cities
            pRouter.get( '/world/countries',    getWorldCountries_Handler   ); // /excel/world/countries

    return  pRouter;
         }; // eom module.exports
// -------  ------------------------------------------------------------
*/


