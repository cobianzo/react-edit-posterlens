import React, {useEffect, createRef} from 'react'

function AppDemoPosterlens( { data, setAppMode } ) {
    
    var refContainer = createRef();

    useEffect(() => {
        console.log('hello from useEffect in App');
        // create the interactive 3d viewer with posterlens
        createViewer(data);
      }, []);

    // CALL to posTERLENS
    function createViewer(data) {
        var posterlensConfig = {}
        if (!data) console.log('data variable not found.')
        else posterlensConfig = data; // `data` is loaded with external file tat sets up `var data = {..}`
            
        // load from cache by default
        var retrievedOptions = JSON.parse( localStorage.getItem('pl.o') ); //retrieve the object to load cache

        data = (retrievedOptions?.worlds) ? retrievedOptions : data;
        if (!data) {
        console.error('No data loaded. Cant initialize');
        return;
        }

        // CALL POSTERLENS
        window.pl = document.querySelector('#posterlens-container').posterlens( data );
        window.pl.viewer.panorama.addEventListener('load', (panolensPanoInstance) => {
            console.log(`🎉🎉🎉🎉🎉🎉🎉🎉`, panolensPanoInstance);
        });
        window.scene = window.pl.viewer.getScene();
    }



    return (
        <div className='container'>
            <h1>Demo  
                { window.location.hash === '#edit'? 
                    <button className='btn btn-sm btn-primary' onClick={ ()=> setAppMode('edit') }>Back</button>
                    : null }
            </h1> 
            <div className='posterlens-container' id='posterlens-container' ref={refContainer}></div>
        </div>
    )
}

export default AppDemoPosterlens
