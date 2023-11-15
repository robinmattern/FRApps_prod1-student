//  --------------------------------------------------------------------------

    import  express from  'express';

    import { chkArgs, sndHTML, getData, sndRecs } from './assets/mjs/server-fns.mjs';
    import { init, start, sayMsg                } from './assets/mjs/server-fns.mjs';

//--------  -----------------------------------------------------------------------------

  if (process.argv[1].replace( /.*[\\/]/, '' ).match( /IODD.*\.mjs/ )) {

       var  pApp      =  express()
       var  pIODD     =  new IODD

            pIODD.init( pApp )
            pIODD.getRoot( "/" )
            pIODD.getRoot( "/home", { 'name': /[A-Z][a-z0-9]+/, 'Name': /.+/ }  )
            pIODD.getLogin( )
            pIODD.getMembers( )
            pIODD.getProjects( )
            pIODD.getProjectCollaborators( )
            pIODD.getMemberProjects( )
            pIODD.getProjectCollaboratorsLetters( '/letters' )
            pIODD.getMeetings( )
            pIODD.start( 50136 )          // not needed. see .env
       }
//--------  -----------------------------------------------------------------------------

  function  IODD ( ) {

//     var  pApp, pDB, aAPI_Host, bQuiet  // Will be defined in this.init() and available in the "Closure(IODD)"
       var  pApp, pDB, aAPI_Host          // Doesn't work for bQuiet, because it is not used in this module
//     var  pApp, pDB                     // Only works for objects, not "singleton"s

       var  pDB_Config   =
//           {  host     : '45.32.219.12'
//           ,  user     : 'nimdas'
//           ,  password : 'FormR!1234'
             {  database : 'iodd'
                }
//------------------------------------------------------------------------------

  this.getTable = function( aGetRoute, pValidArgs ) {

        var aMethod   = 'get'
        var aRoute    = '/table'

            aGetRoute =  aGetRoute  ? aGetRoute  : aRoute
            pValidArgs=  pValidArgs ? pValidArgs :
                       { recs:    /[0-9]/
                       , letters: /([a-z],)*[a-z]/
                         }
//          ---------------------------------------------------

            setRoute(    aMethod, aGetRoute, pValidArgs, fmtSQL )

//          ---------------------------------------------------

  function fmtSQL( pArgs ) {
       var  nRecs     =  pArgs.recs || 999
       var  aLetters  =  pArgs.letters

        if (aLetters) {  // --------------------------------
       var  aSQL      = `
              SELECT  *
                FROM  table
               WHERE  substring( Name, 1, 1) in ( '${ aLetters.replace( /,/, "','" ) }' )
            ORDER BY  Name `
        } else {
       var  aSQL      = `
              SELECT (@nRow:=@nRow + 1) AS RNo, countries_view.*
                FROM  table
                   , (SELECT @nRow:=0) AS T
               WHERE  @nRow <= ${nRecs}
            ORDER BY  Id `
            }
    return  aSQL
            };
//     ---  ---------------------------------------------------
       }
//---- -------------------------------------------------------------------




//------------------------------------------------------------------------------

  this.getRoot  = function( aGetRoute, pValidArgs ) {

       var  aMethod   = 'get'
       var  aRoute    = '/'

            aGetRoute =  aGetRoute  ? aGetRoute  : aRoute
            pValidArgs=  pValidArgs ? pValidArgs : { }
//          ---------------------------------------------------

       pApp.get( `${aAPI_Host}${aGetRoute}`, function( pReq, pRes ) {

                         sayMsg(  pReq, aMethod, aGetRoute )
       var  pArgs     =  chkArgs( pReq, pRes, pValidArgs ); if (!pArgs) { return }
       var  aHTML     =  fmtRoot( pArgs.name || '' )
                         sndHTML( pRes, aHTML, `${aGetRoute}${pReq.args}` )

            } )   // eof pApp.get( / )
                         sayMsg(  aMethod, aGetRoute )
//          ---------------------------------------------------

  function  fmtRoot( aName ) {
       var  aHTML = `
                Welcome ${aName} to IODD MySQL Express Server API.<br>
                Use any of the following APIs:<br>
                <div style="margin-left:20px">
                <a href="/login"                        >/login</a><br>
                <a href="/meetings"                     >/meetings</a><br>
                <a href="/members"                      >/members</a><br>
                <a href="/members?recs=10"              >/members?recs=10</a><br>
                <a href="/member-projects"              >/member-projects</a><br>
                <a href="/projects"                     >/projects</a><br>
                <a href="/projects?letters=a,r"         >/projects?letters=a,r</a><br>
                <a href="/project_colaborators"         >/project_colaborators</a><br>
                <a href="/project_colaborators_letters" >/project_colaborators_letters</a><br>
                </div> `;
    return  aHTML
            }; // eof fmtRoot
//     ---  ---------------------------------------------------
       } // eof getRoot
//---- -------------------------------------------------------------------

//------------------------------------------------------------------------------

  this.getProjects = function( aGetRoute, pValidArgs ) {

        var aMethod   = 'get'
        var aGetRoute = '/projects'

            pValidArgs={ id:     /[0-9]+/
                       , name:   /[a-zA-Z][a-zA-Z0-9]+/
                       , letters: /([a-z],)*[a-z]/
                         }
//          ---------------------------------------------------

       pApp.get( `${aAPI_Host}${aGetRoute}`, async function( pReq, pRes ) {

                         sayMsg(  pReq, aMethod, aGetRoute )
       var  pArgs     =  chkArgs( pReq, pRes,  pValidArgs  ); if (!pArgs) { return }
       var  aSQL      =  fmtSQL(  pArgs )
       var  mRecs     =  await getData( pDB,   aSQL  );
                         sndRecs( pRes, mRecs, aSQL, aGetRoute )

            } )   // eof pApp.get( /projects)
                         sayMsg(  aMethod, aGetRoute )
//          ---------------------------------------------------

  function  fmtSQL( pArgs ) {
       var  aClause   = '1 = 1'
            aClause   =  pArgs.id      ? `ProjectId = ${ pArgs.id }`     : aClause
            aClause   =  pArgs.name    ? `ProjectName LIKE '%${ pArgs.name }%'` : aClause
            aClause   =  pArgs.letters ? `substring( ProjectName, 1, 1) in ( '${ pArgs.letters.replace( /,/g, "','" ) }' )` : aClause

       var  aSQL      = `
              SELECT  DISTINCT
                      members_projects_colaboration_view.*
                FROM  members_projects_colaboration_view
               WHERE  ${aClause}
            ORDER BY  ProjectName `
    return  aSQL
            }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getProjects
//---- -------------------------------------------------------------------
//------------------------------------------------------------------------------

  this.getMembers = function( aGetRoute, pValidArgs ) {

       var  aMethod   = 'get'
       var  aRoute    = '/members'

//          aGetRoute =  aGetRoute  ? aGetRoute  : aRoute
//          pValidArgs=  pValidArgs ? pValidArgs : { recs: /[0-9]/ }
//          ---------------------------------------------------

       pApp.get( `${aAPI_Host}${aRoute}`, async function( pReq, pRes ) {

                         sayMsg(  pReq, aMethod, aRoute )
       var  pArgs     =  chkArgs( pReq, pRes,  pValidArgs  ); if (!pArgs) { return }
       var  aSQL      =  fmtSQL(  pArgs )
       var  mRecs     =  await getData( pDB,   aSQL  );
                         sndRecs( pRes, mRecs, aSQL, aRoute )

            } )   // eof pApp.get( /members )
                         sayMsg(  aMethod, aRoute )
//          ---------------------------------------------------

  function  fmtSQL( pArgs ) {
       var  nRecs     =  pArgs.name ? 0 : ( pArgs.recs || 999 )
       var  aName     =  pArgs.name

        if (nRecs) {     // --------------------------------
       var  aSQL      = `
              SELECT * FROM (
              SELECT (@nRow:=@nRow + 1) AS RNo
                   ,  members_projects_colaboration_view.*
                FROM  members_projects_colaboration_view
                   , (SELECT @nRow:=0)  AS T
            ORDER BY  LastName ) AS A
               WHERE  RNo <= ${nRecs} `
            }

        if (aName) {     // --------------------------------
       var  aSQL      = `
              SELECT  *
                FROM  members_projects_colaboration_view
               WHERE  concat( FirstName, ' ', LastName) LIKE '%${aName}%'
            ORDER BY  LastName `
            }
    return  aSQL
         }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getMembers
//---- -------------------------------------------------------------------

//------------------------------------------------------------------------------

  this.getProjectCollaborators = function( ) {

       var  aRoute    = '/project_colaborators'
       var  pValidArgs=  { id: /[0-9]+/ }
//          ---------------------------------------------------

       pApp.get( `${aAPI_Host}${aRoute}`, async function( pReq, pRes ) {

                         sayMsg(  pReq, 'get', aRoute )
       var  pArgs     =  chkArgs( pReq, pRes,  pValidArgs  ); if (!pArgs) { return }
       var  aSQL      =  fmtSQL(  pArgs )
       var  mRecs     =  await getData( pDB,   aSQL  );
                         sndRecs( pRes, mRecs, aSQL, aRoute )

            } )   // eof pApp.get( /project_colaborators )
                         sayMsg( 'get', aRoute )
//          ---------------------------------------------------

  function  fmtSQL( pArgs ) {
        var nId       =  pArgs.id || 0
        var aSQL      = `
              SELECT  Distinct *
                FROM  members_projects_view
     ${ nId ? `WHERE  ProjectId = ${ nId }` : `` } `
     return aSQL
            }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getProjectCollaborators
//---- -------------------------------------------------------------------



//------------------------------------------------------------------------------

  this.getMemberProjects = function( ) {

       var  aRoute = `${aAPI_Host}/member_projects`

       pApp.get( aRoute, async ( pReq, pRes ) => onGetRoute( pReq, pRes, '/member_projects', { id: /[0-9]+/ }, fmtSQL ) )
            sayMsg( 'get', aRoute )

//          ---------------------------------------------------

  function  fmtSQL( pArgs ) {
    return  ` SELECT * FROM members_projects_view `

         }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getMemberProjects
//---- -------------------------------------------------------------------

//------------------------------------------------------------------------------

  this.getProjectCollaboratorsLetters = function( aGetRoute ) {

       var  aRoute    = '/project_collaborators_letters'
            aGetRoute =  aGetRoute  ? aGetRoute : aRoute

            setRoute(   'get', aGetRoute, fmtSQL )

//          ---------------------------------------------------

  function  fmtSQL( pArgs ) {

    return  ` SELECT  Distinct substr(LastName,1,1) as Letter
                FROM  members_projects_view
            ORDER BY  1 `

         }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getProjectCollaboratorsLetters
//---- -------------------------------------------------------------------

//------------------------------------------------------------------------------

  this.getMeetings = function( pValidArgs ) {

//     var  pValidArgs= { id: /[0-9]+/, date: /1*[0-9]\/[0123][0-9]\/202[3-4]/, required: 'yes' }
       var  pValidArgs= { id: /[0-9]+/, date: /1*[0-9]\/[123]*[0-9]\/202[3-4]/ }   // 4/02/2023  no workie

            setRoute( 'get', '/meetings', pValidArgs, fmtSQL )

//          ---------------------------------------------------

  function  fmtSQL( pArgs ) {
       var  aSQL = `
              SELECT  *
                FROM  meetings_view     ${ pArgs.date ?
             ` WHERE  strMeetingDate = '${ pArgs.date }' ` : '' } `
    return  aSQL
         }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getMeetings
//---- -------------------------------------------------------------------

//------------------------------------------------------------------------------

  this.getLogin = function( ) {

       var  aRoute    = '/login'
       var  pValidArgs= { }

       pApp.get( `${aAPI_Host}${aRoute}`, onget )

     async  function onget ( pReq, pRes) {
                     onGetRoute(   pReq, pRes, aRoute, pValidArgs, fmtSQL )
                     }
                     sayMsg( 'get', aRoute )
//          ---------------------------------------------------

  function  fmtSQL( pArgs ) {
    return  ` SELECT * FROM login_check_view `

         }; // eof fmtSQL
//     ---  ---------------------------------------------------
       } // eof getLogin
//---- -------------------------------------------------------------------
//------------------------------------------------------------------------------

  function  setRoute( aMethod, aRoute_, pValidArgs, fmtSQL ) {

       var  aRoute   = `${aAPI_Host}${aRoute_}`
            fmtSQL   =  fmtSQL ? fmtSQL : pValidArgs

    switch (aMethod) {
      case 'get'   : pApp.get(    aRoute, async function( pReq, pRes )    { onGetRoute(    pReq, pRes, aRoute, pValidArgs, fmtSQL ) } ); break
      case 'post'  : pApp.post(   aRoute, async function( pReq, pRes )    { onPostRoute(   pReq, pRes, aRoute, pValidArgs, fmtSQL ) } ); break
      case 'put'   : pApp.put(    aRoute, async         ( pReq, pRes ) => { onPutRoute(    pReq, pRes, aRoute, pValidArgs, fmtSQL ) } ); break
      case 'delete': pApp.delete( aRoute, async         ( pReq, pRes ) => { onDeleteRoute( pReq, pRes, aRoute, pValidArgs, fmtSQL ) } ); break
//    case 'patch' : pApp.patch(  aRoute, xController ); break
        default    : null
            }
            sayMsg( 'get', aRoute_ )
     }
//---- -------------------------------------------------------------------

  async function  onGetRoute( pReq, pRes, aRoute, pValidArgs, fmtSQL ) {

                         sayMsg(  pReq, 'get', aRoute )
       var  pArgs     =  chkArgs( pReq, pRes,  pValidArgs  ); if (!pArgs) { return }
       var  aSQL      =  fmtSQL(  pArgs )
       var  mRecs     =  await getData( pDB,   aSQL  );
                         sndRecs( pRes, mRecs, aSQL, aRoute )

            } // eof pApp.get( /{aGetRoute}, onGetRoute )
//---- -------------------------------------------------------------------

        this.init  = function( pApp_, bQuiet_ ) {
            pApp  =  pApp_  // express()
      var { pDB_,    aAPI_Host_, bQuiet_ } = init( pApp, pDB_Config, bQuiet_ );  // no workie without var, and must returned vars must be underlined
//          pDB   =  pDB_; aAPI_Host = aAPI_Host_, bQuiet = bQuiet_              // but only works for objects, not "singleton"s. Probably not true, just a theory
            pDB   =  pDB_; aAPI_Host = aAPI_Host_                                // and must use underlined vars to reset globals
       }
//     -------------------------------------------------------------

  this.start = function( nPort ) { start( pApp, nPort, aAPI_Host ) }

//     -------------------------------------------------------------
    }
//  --------------------------------------------------------------------------

    export { IODD }
