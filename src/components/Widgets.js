import {useEffect, useState} from 'react';


function Widgets( p ) {

    const v = p.pl?.viewer;
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
        Array.from([ /*'link',*/ 'poster3d', 'text-3d', 'text-2d', 'poster-sprite'] ).forEach( type => {
            v.appendControlItem({
                id: 'edit-controls',
                style: {
                    backgroundImage: 'url(posterlens/assets/widget-'+type+'.png)',
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
        if (p.pl && p.isEditMode) 
            //if (!p.pl.viewer.widget) 
                initWidgets() // TODO: if deactivate and reactivate the editmode, the widgets are created again (duplicated)
                // we can use pl.viewer.widget.barElement.remove() when deactivated to delete the previous ones. But ideally we could avoid calling this init if they exist.
    }, [p.countResets]);



    const initNewObject = function(type = 'poster3d') {
        // get Scene by name:
        const params = {
            name:  `new_${type}_` + Math.floor(Math.random() * 10000),
            type: type,
            pos: Object.values(v.camera.getWorldDirection(new p.globalVars.THREE.Vector3()).multiplyScalar(300)),
            image: 'https://images-na.ssl-images-amazon.com/images/I/91ovrqFkzkL._RI_SX200_.jpg',
        }
        switch (type) {
            case 'link': break;
            case 'poster3d': 
            break;
            case 'poster-sprite': break;
            case 'text-2d': 
                params.text = "New text"; 
                break;
            case 'text-3d':
                params.fontFamily = 'posterlens/assets/fonts/Century_Gothic_Regular.js';
                params.text = "New text";
                break;
            default: break;
        }

        p.pl.createNewObjectFromParams(v.panorama, params);

        // update states object 3d in viewer & object params for posterlens
        const newObj = p.pl.viewer.panorama.getObjectByName(params.name);
        p.setCurrentObjectData(params);
        p.setCurrentObject3D(newObj);
        const currentWorldOptions = Object.assign( {}, p.worldOptions );
        currentWorldOptions.hotspots.push(params);
        p.setWorldOptions(Object.assign( {}, currentWorldOptions ) );

        // Case of poster infoSpot. For some reason it doesnt show at 1st instance. We need to reload the whole posterlens plugin:
        if (type === 'poster-sprite') p.restartViewer();

        return { newObj, params } ;
    }

  // its all vanilla js, connecting with panolens. No HTML
  return (
    null
  );
}

export default Widgets;
