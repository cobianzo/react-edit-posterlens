import {useEffect, useState} from 'react';


import {THREE} from 'panolens-three';


function Widgets( p ) {

    const v = window.pl?.viewer;
    const [isWidgetsInit, setIsWidgetsInit ] = useState(false);
    const initWidgets = function() {
        if (isWidgetsInit) return;
        setIsWidgetsInit(true);
        // Widgets
        // Buttn to enable/disable Edit Mode: NOT IN USE
        v.appendControlItem({
            style: {
                backgroundImage: 'url(https://images-na.ssl-images-amazon.com/images/I/91ovrqFkzkL._RI_SX200_.jpg)',
                float: 'left'
            },    
            onTap: () => { 
                var updateIsEdit = !p.isEditMode;
                p.setIsEditMode(updateIsEdit);
                if (updateIsEdit && typeof p.globalVars.stopAllAnimations !== 'undefined') p.globalVars.stopAllAnimations(v);  
                // p.exportOptions('input'); // console the new
            },
            group: 'editmode'
        });
        // Create poster buttons. One for every type.
        Array.from([ /*'link', */
                    'poster-sprite',
                    'poster3d',
                    'poster3d-sphere',
                    'text-3d',
                    'text-2d',
                    'text-2d-sprite' 
            ] ).forEach( type => {
                v.appendControlItem({
                    id: 'edit-controls',
                    style: {
                        backgroundImage: 'url(resources/widget-'+type+'.png)',
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
            pos: Object.values(v.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(300)), // this normalizes but not to unitary, but to 300 long
        }
        switch (type) {
            // case 'link': break;
            case 'poster3d': 
                params.image = 'resources/poster3.jpg';
            break;
            case 'poster3d-sphere': 
                params.image = 'resources/poster3.jpg';
                params.type = 'poster3d';
                params.posterSphere = true;
            break;
             case 'poster-sprite': break;
                params.sprite = true; 
            case 'text-2d': 
                params.text = "New text"; 
                break;
            case 'text-2d-sprite': 
                params.text = "New text"; 
                params.sprite = true; 
                params.type = 'text-2d';
                break;
            case 'text-3d':
                params.fontFamily = 'resources/fonts/Century_Gothic_Regular.js';
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
