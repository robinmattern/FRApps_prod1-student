
  import    express   from 'express'

  import  { World }   from './World-Server.mjs'
  import  { IODD  }   from './IODD-Server.mjs'

       var  pWorld =  new World
       var  pIODD  =  new IODD

       var  pApp   =  express()
/*
            pIODD.init( pApp,true )
            pIODD.getRoot( "/" )
            pIODD.getRoot( "/home", { 'name': /[A-Z][a-z]+/, 'Name': /.+/ }  )
            pIODD.getLogin( )
            pIODD.getMembers( )
            pIODD.getProjects( )
            pIODD.getProjectCollaborators( )
            pIODD.getMemberProjects( )
            pIODD.getProjectCollaboratorsLetters( '/letters' )
            pIODD.getMeetings( )
//          pWorld.start( 3002 )
*/
            pWorld.init( pApp, true )
            pWorld.getCountries( '', { 'recs': /[0-9]+/ } )
            pWorld.getCities( )
            pWorld.getLanguages( )
            pWorld.start( 50144 )


