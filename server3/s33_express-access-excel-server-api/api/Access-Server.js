
   var  express          =  require( 'express' );

   var  dotenv           =  require( 'dotenv' );
   var  fs               =  require( 'fs' )

   var  pADODB           =  require( 'node-adodb' )

   var  { fmtClientMsg } =  require( './getExcel_Rows.js' )

   var  __filename       =  process.argv[1].replace( /.*[\\\/]/, "" )
   var  __dirname        =  process.argv[1].replace( __filename, "" ).replace( /[\\\/]$/, "" )

// -------  ------------------------------------------------------------

        dotenv.config( { path: `${__dirname}/../.env` } )

   var  pCfg             = { Server: {}, Client: {} }

        pCfg.Client =
         {  AccessName   : 'World.accdb'
         ,  setAccessFile:  function( ) { return pCfg.Client.AccessFile  = `${pCfg.Server.DataPath }/${pCfg.Client.AccessName }` }
            }
// -------  ------------------------------------------------------------

   var      pAccessRoutes=  express.Router();

/*   module.exports = ( ) => {





            pRouter.get( '/world/cities',       getWorldCities_Handler      ); // /access/world/cities
            pRouter.get( '/world/countries',    getWorldCountries_Handler   ); // /access/world/counties

    return  pRouter;
         }; // eom module.exports
// -------  ------------------------------------------------------------
*/
//async function  getWorldCities_Handler                        // access/world/cities
pAccessRoutes.get( '/cities', async ( req, res ) => {           // access/world/cities

//  res.send('Hello from the /access/world/cities route!');

       var  pArgs =  req.query || {}                            // why does the browser URL version executed twice? 
       var  pFlds =  req.body  || {}
       var  aSQL  = (pArgs.sql > '') ?  pArgs.sql : pArgs.SQL   // pArgs.SQL || pArgs.sql               // .(31107.03.4 RAM)
            aSQL  =  aSQL  > '' ?  aSQL  : 'select * from city' // pArgs.SQL || ''

       var  pData =  await getData( aSQL )  // console.log( "  Error: ", pData.error )
        if (pData.error) { console.log( "* Error: ", pData.error, `\n${ '-'.repeat(96) }` )             // .(31108.02.1)
       var  aMsg  =  `\\n * ${pData.error}`
            res.send( fmtClientMsg( `Unable to retreive City data from the Access file, '${pCfg.Client.AccessName}'!`,    2, aMsg ) )    //#.(31108.02.2)
//          res.json( { error: fmtClientMsg( `Unable to retreive City data from the URL, '${pCfg.Client.AccessName}'!`,    2, aMsg ) } )  // .(31108.02.2 RAM Send json error)
        } else {
       var  mRows =  pData.rows
            console.log( `  Returning ${ mRows.length } cit${ mRows.length == 1 ? "y" : "ies"}.` )      // .(31107.03.5 RAM)

       var  pJSON = { "cities": mRows };   
            res.set(  'Content-Type', 'application/json' )                                              // .(31107.02.6 RAM Shouldn't be necessary but .. )    
            res.status( 200 ).send( JSON.stringify( pJSON ) )                                      // .(31107.02.7 RAM Send it, but browser's fetch aborts??) 
//          res.status( 200 ).json(                 pJSON )

         } } )
// -------  ------------------------------------------------------------

//async function  getWorldCountries_Handler                     // access/world/countries
pAccessRoutes.get( '/countries', async( req, res ) => {         // access/world/countries

//    res.send('Hello from the /access/world/countries route!');

       var  pArgs =  req.query || {}
       var  pFlds =  req.body  || {}
                     pArgs.SQL  = (pArgs.sql > '') ? pArgs.sql : ''                                     // .(31107.03.6 RAM)
       var  aSQL  =  pArgs.SQL  > '' ?  pArgs.SQL : 'select * from country'

       var  pData =  await getData( aSQL );                     // see getData() below
        if (pData.error) { console.log( "* Error: ", pData.error, `\n${ '-'.repeat(96) }` )
       var  aMsg  =  `\\n * ${pData.error}`
//          res.send( fmtClientMsg( `Unable to retreive Country data from the URL, '${pCfg.Client.AccessName}'!`, 2, aMsg ) )             //#.(31108.02.3)
            res.json( { error: fmtClientMsg( `Unable to retreive Country data from the Access file, '${pCfg.Client.AccessName}'!`, 2, aMsg ) } )  // .(31108.02.3)

        } else {
        var mRows =  pData.rows
            console.log( `  Returning ${ mRows.length } countr${ mRows.length == 1 ? "y" : "ies"}` )    // .(31107.03.7 RAM)

       var  pJSON = { "countries": mRows };
            res.status( 200 ).json( pJSON )

         } } )
// -------  ------------------------------------------------------------

  async function  getData( aSQL ) {

   var  aDB_Path = `${__dirname}\\..\\data\\World.accdb`        // .replace( /[\\\/]/g, "/" )

// var  pCStr    =  pADODB.open( `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${ aDB_Path};` )
   var  pCStr    =  pADODB.open( `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${aDB_Path};` )

// var  aSQL     = 'SELECT * FROM city where Name like "New%"'

   try {
   var  mRows    =  await pCStr.query ( aSQL )  // mRecordset
//      console.log( pRS )
   var  nRows    = (typeof( mRows) != 'undefined' ) ? 99 : -1                  
   var  mRows    =  mRows.filter( ( pRow, i ) => { return i < nRows } )             

        return { "rows" : mRows }

    } catch( pErr ) {
        console.log( "getData[112]  ", pErr )
        return { "error": pErr.process.message.replace( /[\\\/]/g, "/" ) }
        }
     // pCN.query(...).on is not a function

         }; // eof getData
// -------  ------------------------------------------------------------

  function  getAccess_Rows( aPath, aTable ) {

    //      ---------------------------------------------------
       try {
       var  pWorkbook =  pExcel.readFile( aPath );
//     var  pSheet    =  pWorkbook.Sheets[ aSheet = aSheet ? aSheet : aSheet1 ];  //#.(30918.02.3)
       var  pSheet    =  pWorkbook.Sheets[ pCfg.Client.ExcelSheet ];               // .(30918.02.3)
       var  mSheet    =  Object.keys( pSheet )
        } catch( pErr ) {
    return  mRows  = [ ]  // return MT array if pExcel.readFile fails
            }
    //      ---------------------------------------------------

        var getRow    = (aTable == "Cities") ? getAccess_CityRow : getAccess_CountryRow

        var mRows  = [ ]
            mSheet.forEach( getRow )  // push each row into mRows
    return  mRows

//    ----  ------------------------------------------------

  function  getAccess_CountryRow( aCell, nCell ) {

        if (aCell.substring(0,1) == "A") {
            var nRow = aCell.substring(1);
            if (nRow > 1) {

            var pRow = { "Code"       :  pSheet[ mSheet[ nCell + 0 ] ].v
                       , "Name"       :  pSheet[ mSheet[ nCell + 1 ] ].v
                       , "Continent"  :  pSheet[ mSheet[ nCell + 2 ] ].v
                       , "Area"       :  pSheet[ mSheet[ nCell + 3 ] ].v
                       , "Population" :  pSheet[ mSheet[ nCell + 4 ] ].v
                          }
            mRows.push( pRow )

                }  // eif not first row
             }  // eif aCell is for column A
         }; // eof getAccess_CountryRow
// -------  ------------------------------------------------------------

     function  getAccess_CityRow( aCell, nCell ) {

        if (aCell.substring(0,1) == "A") {
            var nRow = aCell.substring(1);
            if (nRow > 1) {
    //      var mRow = [ nRow, pSheet[ mSheet[i+0] ].v, pSheet[ mSheet[i+1] ].v,
    //                    , pSheet[ mSheet[i+2] ].v, pSheet[ mSheet[i+3] ].v, pSheet[ mSheet[i+4] ].v ]
            var pRow = { "ID"         :  pSheet[ mSheet[ nCell + 0 ] ].v
                       , "Name"       :  pSheet[ mSheet[ nCell + 1 ] ].v
                       , "CountryCode":  pSheet[ mSheet[ nCell + 2 ] ].v
                       , "District"   :  pSheet[ mSheet[ nCell + 3 ] ].v
                       , "Population" :  pSheet[ mSheet[ nCell + 4 ] ].v
                          }
            mRows.push( pRow )

                }  // eif not first row
             }  // eif aCell is for column A
         }; // eof getAccess_CityRow
//    ----  ------------------------------------------------
         }; // eof getAccess_Rows
// -------  ------------------------------------------------------------

     module.exports = pAccessRoutes;

// -------  ------------------------------------------------------------

