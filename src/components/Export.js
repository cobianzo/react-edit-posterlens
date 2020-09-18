import React, {useEffect} from 'react';


function Export( p ) {

    const initExport = function() {
        if (!p.pl) return;
    }
    useEffect(() => {
        initExport()
    }, [p.pl])
  
    // we update local storage with the options. On reload page , changes will persist.
    useEffect(() => { 
        console.log('updating localstorage with worldoptions', );
        exportOptions('localStorage')        
    }, [p.worldOptions]);

    function showWorldOptionsJSON() {
       return p.worldOptions ? JSON.stringify(p.worldOptions, null, 2).split('\n').map( (i, index) => <React.Fragment key={index}> {i}<br/></React.Fragment>) : null;
    }

    const exportOptions = function(mode='console') {
        if (!p.pl) return;
        const originalOptions = p.pl.o;
        // get index of panorama in options
        const woldIndex = originalOptions?.worlds.findIndex( w => w.name === p.worldOptions.name );
        if (woldIndex < 0) return;
        p.pl.o.worlds[woldIndex] = p.worldOptions;
        
        var exportStr = JSON.stringify(p.pl.o, false, 2);
        if (mode === 'localStorage') {
            if (Object.keys(p.worldOptions).length) 
            localStorage.setItem('worldOptions', exportStr); //stringify object and store
            return
        }
        exportStr = 'var data = ' + exportStr; // .split('\n').map( line => line.replace('"', '').replace('"', '') ).join('\n')
        if (mode === 'console')
            console.log(exportStr);
        else {
            var textA = document.createElement( 'textarea' );
            textA.textContent = exportStr;
            textA.style.width = '100%'
            textA.style.height= '500px';
            const modal = new p.pl.Modal('Export JSON', textA);
        }
    
    }


  // its all vanilla js, connecting with panolens. No HTML
  return (
      <React.Fragment>
        <b>Hotspots: {p.worldOptions?.hotspots?.map( ht => ht.name + ', ') } </b><br/>
        { p.pl? <button className="btn btn-warning" onClick={ (e) => { exportOptions('modal') }  }>Export </button> : null }
        { p.pl? <button className="btn btn-danger" onClick={ (e) => { localStorage.setItem('worldOptions', null); p.restartViewer(); }  }>Clear cache </button> : null }
        <blockquote style={{ background: 'gray', paddingLeft:'10px' }}>
            { showWorldOptionsJSON() }
        </blockquote>
     </React.Fragment>

  );
}

export default Export;
