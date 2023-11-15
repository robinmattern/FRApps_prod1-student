

   var  fs               =  require( 'fs'   );
   var  dotenv           =  require( 'dotenv' );

   var  pExcel           =  require( 'XLSX' );  // https://github.com/richardgirges/express-fileupload

   var  __filename       =  process.argv[1].replace( /.*[\\\/]/, "" )
   var  __dirname        =  process.argv[1].replace( __filename, "" ).replace( /[\\\/]$/, "" )

// -------  ------------------------------------------------------------

        dotenv.config( { path: `${__dirname}/../.env` } )

   var  pCfg             = { Server: {}, Client: {} }
        pCfg.Server =
          {  Port        :  50133
          ,  UploadPath  : `${__dirname}/../data/uploads`
          ,  DataPath    : `${__dirname}/../data`             
             }
        pCfg.Client =
         {  Port         :  5500
         ,  FormFld      : 'fldExcelFile'
         ,  ExcelName    : 'Countries.xlsx'
//       ,  ExcelSheet   : "Data"
         ,  AppDir       : 'client2/c24_javascript-mysql-server-app/app'
         ,  ExcelFile    :                                                `${ pCfg.Server.UploadPath}/${pCfg.Client.ExcelName }`
         ,  setExcelFile :  function( ) { return pCfg.Client.ExcelFile  = `${ pCfg.Server.UploadPath}/${pCfg.Client.ExcelName }` }
            }
// -------  ------------------------------------------------------------

  function  getExcel_Rows( aPath, aSheet ) {

       var  aSheet1   =  pCfg.Client.ExcelName == "World.Excel" ? 'Cities' : "Data" // .(30918.02.1 RAM Kludge, I know)
            pCfg.Client.ExcelSheet = aSheet ? aSheet : aSheet1                      // .(30918.02.2)

    //      ---------------------------------------------------
       try {
       var  pWorkbook =  pExcel.readFile(  aPath );
//     var  pSheet    =  pWorkbook.Sheets[ aSheet = aSheet ? aSheet : aSheet1 ];    //#.(30918.02.3)
       var  pSheet    =  pWorkbook.Sheets[ pCfg.Client.ExcelSheet ];                // .(30918.02.3)
       var  mSheet    =  Object.keys( pSheet )
        } catch( pErr ) {
    return  mRows  = [ ]  // return MT array if pExcel.readFile fails
            }
    //      ---------------------------------------------------

        var getRow    = (aSheet == "Cities") ? getExcel_CityRow : getExcel_CountryRow
         
        var mRows     = [ ]
            mSheet.forEach( getRow )  // push each row into mRows
            mRows  =  mRows.filter( ( pRow, i ) => { return i < 99 } )                                  // .(31107.03.8 RAM Just 99 rows )      

    
    return  mRows

//    ----  ------------------------------------------------

  function  getExcel_CountryRow( aCell, nCell ) {

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
         }; // eof getExcel_CountryRow
//    ----  ------------------------------------------------ 
 
     function  getExcel_CityRow( aCell, nCell ) {

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
         }; // eof getExcel_CityRow
//    ----  ------------------------------------------------ 
         }; // eof getExcel_Rows    
// -------  ------------------------------------------------------------

  function  makExcel_FileBuffer( mRows, aSheet ) {  

                         pExcel.set_fs( fs );

       var  pSheet    =  pExcel.utils.json_to_sheet( mRows );
       var  pWorkBook =  pExcel.utils.book_new();
                         pExcel.utils.book_append_sheet( pWorkBook, pSheet, aSheet );
       var  pBuffer   =  pExcel.write( pWorkBook, { type: "buffer", bookType: "xlsx" } );  /* generate buffer */
     return pBuffer 

        }; // eof getExcel_FileBuffer     
// -------  ------------------------------------------------------------

    function fmtClientMsg( aMsg1, nMsg, aMsg2 ) {  
        var  aMsg3 = (nMsg == 2) ? "Press the back button to return to the FormR app."
                                 : "Close the current tab to return to the FormR app."
        var  aHTML = `<script> alert( "${aMsg1}${aMsg2 || ""}\\n" + "${aMsg3}" ) </script>`
     return  aHTML
         };
// -------  ------------------------------------------------------------         

// module.exports = getExcel_Rows
module.exports = { pCfg, getExcel_Rows, fmtClientMsg, pExcel, makExcel_FileBuffer }

