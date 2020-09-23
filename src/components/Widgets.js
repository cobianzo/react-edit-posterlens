import {useEffect, useState} from 'react';


function Widgets( p ) {

    const v = window.pl?.viewer;
    const [isWidgetsInit, setIsWidgetsInit ] = useState(false);
    const initWidgets = function() {
        if (isWidgetsInit) return;
        setIsWidgetsInit(true);
        if (typeof window.basePath === 'undefined') window.basePath = './';
        // Widgets
        // Create poster buttons. One for every type.
        Array.from([ /*'link', */
                    // 'poster-sprite', // type poster3d + sprite = true
                    'poster3d',
                    'poster3d-sphere', // type poster3d + posterSphere = true
                    'text-3d', // doesnt work
                    'text-2d',
                   // 'text-2d-sprite' // type text-2d + sprite = true 
            ] ).forEach( type => {
                v.appendControlItem({
                    id: 'edit-controls',
                    style: {
                        backgroundImage: 'url('+window.basePath+'resources/widget-'+type+'.png)',
                        float: 'left'
                    },    
                    onTap: () => { 
                        const { newObj, objectData } = initNewObject( type );
                        console.log('Created new obj: ', { newObj, objectData })
                    },
                    group: 'editmode'
                });
        })
    }
    useEffect(() => {
        console.log('Hellow from widgets');
        if (window.pl && p.isEditMode) 
            //if (!p.pl.viewer.widget) 
                initWidgets() // TODO: if deactivate and reactivate the editmode, the widgets are created again (duplicated)
                // we can use pl.viewer.widget.barElement.remove() when deactivated to delete the previous ones. But ideally we could avoid calling this init if they exist.
    }, [p.countResets]);



    const initNewObject = function(type = 'poster3d') {
        // get Scene by name:
        const params = {
            name:  `new_${type}_` + Math.floor(Math.random() * 10000),
            type: type,
            pos: Object.values(v.camera.getWorldDirection(new window.THREE.Vector3()).multiplyScalar(300)), // this normalizes but not to unitary, but to 300 long
        }
        switch (type) {
            // case 'link': break;
            case 'poster3d': 
                params.image = window.basePath+'resources/poster3.jpg';
            break;
            case 'poster3d-sphere': 
                params.image = window.basePath+'resources/poster3.jpg';
                params.type = 'poster3d';
                params.posterSphere = true;
            break;
            //  case 'poster-sprite': 
            //     params.type = 'poster3d';
            //     params.sprite = true; 
            //     break;
            case 'text-2d': 
                params.text = "New text"; 
                break;
            // case 'text-2d-sprite': 
            //     params.type = 'text-2d';
            //     params.sprite = true; 
            //     params.text = "New text"; 
            //     break;
            case 'text-3d': // doesnt work
                params.type = 'text-3d';
                params.fontFamily = window.basePath+'resources/fonts/Century_Gothic_Regular.js';
                params.text = "New text";
                break;
            default: break;
        }

        // posterlens fn
        window.pl.createNewObjectFromParams(v.panorama, params);

        // update states object 3d in viewer & object params for posterlens
        const newObj = window.pl.viewer.panorama.getObjectByName(params.name);
        p.setCurrentObject3D(newObj);
        // update posterlens option
        
        // update the option settings
        let worldParams = p.getCurrentPanoramaParams();
        worldParams.hotspots.push(params);
        const newPlOptions = p.plOptionsReplaceWorldParams(worldParams);
        p.setPlOptions(newPlOptions);
        
        
        
        return { newObj, params } ;
    }

  // its all vanilla js, connecting with panolens. No HTML
  return (
    null
  );
}

export default Widgets;
