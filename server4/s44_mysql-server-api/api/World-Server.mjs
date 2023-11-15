//------------------------------------------------------------------------------

    import  express from  'express';

    import { chkArgs, sndHTML, getData, sndRecs } from './assets/mjs/server-fns.mjs';
    import { init, start, sayMsg                } from './assets/mjs/server-fns.mjs';

//--------  -----------------------------------------------------------------------------

  if (process.argv[1].replace( /.*[\\/]/, '' ).match( /World.*\.mjs/ )) {

       var  pApp      =  express()
       var  pWorld    =  new World

            pWorld.init( pApp, false )
            pWorld.getCountries( )
            pWorld.getCities( )
            pWorld.getLanguages( )
            pWorld.start( 50144 )
       }
//--------  -----------------------------------------------------------------------------

  function  World ( ) {

       var  pApp, pDB, aAPI_Host          // Doesn't work for bQuiet, because it is not used in this module

       var  pDB_Config   =
             {  database : 'world'
                }
//------------------------------------------------------------------------------
 
  this.getCountries = function( aGetRoute, pValidArgs ) {

        var aMethod   = 'get'
        var aRoute    = '/api/countries'   // .(30913.01.1 RAM was '/countries') 

            aGetRoute = `${ aGetRoute ? aGetRoute : aRoute }`
            pValidArgs=  pValidArgs ? pValidArgs : { recs: /[0-9]/ }

            pValidArgs.sql = /^select.+/i
            pValidArgs.SQL = /^select.+/i

//          ---------------------------------------------------

       pApp.get( `${aAPI_Host}${aGetRoute}`, async function( pReq, pRes ) {

                         sayMsg(  pReq, aMethod, aGetRoute )
       var  pArgs     =  chkArgs( pReq, pRes,  pValidArgs  ); if (!pArgs) { return }
       var  aSQL      =  fmtSQL(  pArgs )
       var  mRecs     =  await getData( pDB,   aSQL  );  // mRecs has error if
                         sndRecs( pRes, mRecs, aSQL, aGetRoute )

            } )   // eof pApp.get( /members )
                        sayMsg(  aMethod, aGetRoute )
//          ---------------------------------------------------

  function fmtSQL( pArgs ) {
           pArgs.SQL = pArgs.SQL || pArgs.sql 

      var  aSQL = pArgs.SQL ? pArgs.SQL : 'SELECT * FROM country'     

// return `SELECT * FROM countries_view `  //#.(30831.02.1 RAM) 
// return  aSQL 

//    var  nRecs     =  pArgs.recs || 999
       if (pArgs.recs) { aSQL = addRecs( aSQL ) }
/*
       return  aSQL      = `
--            SELECT * FROM ()                           --#.(30831.02.1 RAM Why was this here)
              SELECT (@nRow:=@nRow + 1) AS RNo
                   ,  countries_view.*
                FROM  countries_view
                   , (SELECT @nRow:=0) AS T ORDER BY Name  -- ) AS A
               WHERE  RNo <= ${nRecs} ` */
    return aSQL;
         }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getCountries
//---- -------------------------------------------------------------------

//------------------------------------------------------------------------------

  this.getCities = function( aGetRoute, pValidArgs ) {

        var aMethod   = 'get'
        var aRoute    = '/api/cities'  // .(30913.01.2 RAM was '/cities') 

            aGetRoute = `${ aGetRoute ? aGetRoute : aRoute }`
            pValidArgs=  pValidArgs ? pValidArgs : { recs: /[0-9]/ }

            pValidArgs.sql = /^select.+/i
            pValidArgs.SQL = /^select.+/i

//          ---------------------------------------------------

       pApp.get( `${aAPI_Host}${aGetRoute}`, async function( pReq, pRes ) {

                         sayMsg(  pReq, aMethod, aGetRoute )
       var  pArgs     =  chkArgs( pReq, pRes,  pValidArgs  ); if (!pArgs) { return }
       var  aSQL      =  fmtSQL(  pArgs )
       var  mRecs     =  await getData( pDB,   aSQL  );  // mRecs has error if
                         sndRecs( pRes, mRecs, aSQL, aGetRoute )

            } )   // eof pApp.get( /members )
                         sayMsg(  aMethod, aGetRoute )
//          ---------------------------------------------------

  function fmtSQL( pArgs ) {
           pArgs.SQL = pArgs.SQL || pArgs.sql 

      var  aSQL = pArgs.SQL ? pArgs.SQL : 'SELECT * FROM city'     

       if (pArgs.recs) { aSQL = addRecs( aSQL, pArgs.recs      ) }
                         aSQL = addSort( aSQL, 'ORDER BY Name' )
   return  aSQL     
         }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getCities
//---- -------------------------------------------------------------------

//------------------------------------------------------------------------------

  this.getLanguages = function( aGetRoute, pValidArgs ) {

        var aMethod   = 'get'
        var aRoute    = '/api/languages'   // .(30913.01.1 RAM was '/languages') 

            aGetRoute = `${ aGetRoute ? aGetRoute : aRoute }`
            pValidArgs=  pValidArgs ? pValidArgs : { recs: /[0-9]/ }
//          ---------------------------------------------------

       pApp.get( `${aAPI_Host}${aGetRoute}`, async function( pReq, pRes ) {

                         sayMsg(  pReq, aMethod, aGetRoute )
       var  pArgs     =  chkArgs( pReq, pRes,  pValidArgs  ); if (!pArgs) { return }
       var  aSQL      =  fmtSQL(  pArgs )
       var  mRecs     =  await getData( pDB,   aSQL  );  // mRecs has error if
                         sndRecs( pRes, mRecs, aSQL, aGetRoute )

            } )   // eof pApp.get( /members )
                         sayMsg(  aMethod, aGetRoute )
//          ---------------------------------------------------

  function fmtSQL( pArgs ) {
       var  nRecs     =  pArgs.recs || 999
       var  aSQL      = `
              SELECT * FROM (
              SELECT (@nRow:=@nRow + 1) AS RNo
                   ,  languages_view.*
                FROM  languages_view
                   , (SELECT @nRow:=0)  AS T
            ORDER BY  Language ) AS A
               WHERE  RNo <= ${nRecs} `
    return  aSQL
         }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getLanguages
//---- -------------------------------------------------------------------

//------------------------------------------------------------------------------

  this.init  = function( pApp_, bQuiet_ ) {
            pApp  =  pApp_  // express()
      var { pDB_,    aAPI_Host_, bQuiet_ } = init( pApp, pDB_Config, bQuiet_ );  // no workie without var, and must returned vars must be underlined
//          pDB   =  pDB_; aAPI_Host = aAPI_Host_, bQuiet = bQuiet_              // but only works for objects, not "singleton"s. Probably not true, just a theory
            pDB   =  pDB_; aAPI_Host = aAPI_Host_                                // and must use underlined vars to reset globals
       }
//     -------------------------------------------------------------

  this.start = function( nPort ) { 
       start( pApp, nPort, aAPI_Host ) 
       }
//     -------------------------------------------------------------
    }
//  --------------------------------------------------------------------------

    export { World }

//  -------------------------------------------------------------------------------------------

function addRecs( aSQL, nRecs ) {
         aSQL = `SELECT (@nRow:=@nRow + 1) AS RNo, ${ aSQL.replace( /SELECT /i, '' ) }` 
     if (aSQL.match( / WHERE/i ) == null ) { aSQL = aSQL + ' '
//       aSQL = `${aSQL} `.replace( /(FROM[( ].+?) /i, `$1 WHERE 1 = 1 AND ` ) 
         aSQL = aSQL.replace( /(FROM[( ].+?) /i, `$1 WHERE 1 = 1 ` ) 
         } 
         aSQL = aSQL.replace( /WHERE /i, `, (SELECT @nRow:=0) WHERE RNo <= ${nRecs} AND ` )
 return  aSQL        
         }

function addSort( aSQL, aOrderBy ) {
     if (aOrderBy) { 
         aOrderBy = aOrderBy.replace( /order by/i, 'ORDER BY' )
     if (aSQL.match(   /ORDER BY/i ) != null ) { 
         aSQL.replace( /ORDER BY (.+)/i, aOrderBy + ', $1' ) 
      }  else {    
         aSQL = `${aSQL} ${aOrderBy}` 
      }  }
 return  aSQL
         }      