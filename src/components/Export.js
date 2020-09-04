import React, {useEffect} from 'react';


function Export( p ) {

    const initExport = function() {


    }
    useEffect(() => {
        initExport()
    }, [p.pl])

    function showWorldOptionsJSON() {
       return p.worldOptions ? JSON.stringify(p.worldOptions, null, 2).split('\n').map(i => <React.Fragment> {i}<br/></React.Fragment>) : null;
    }

  // its all vanilla js, connecting with panolens. No HTML
  return (
      <React.Fragment>
        <b>Hotspots: {p.worldOptions?.hotspots?.map( ht => ht.name + ', ') } </b><br/>
        <blockquote style={{ background: 'gray', paddingLeft:'10px' }}>
            { showWorldOptionsJSON() }
        </blockquote>
     </React.Fragment>

  );
}

export default Export;
