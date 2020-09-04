import React, {useEffect} from 'react';


function Widgets( p ) {

    const v = p.pl.viewer;

    const initWidgets = function() {

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
        // Create poster
        v.appendControlItem({
            style: {
                backgroundImage: 'url(https://images-na.ssl-images-amazon.com/images/I/91ovrqFkzkL._RI_SX200_.jpg)',
                float: 'left'
            },    
            onTap: () => { 
                let pos = v.camera.getWorldDirection(new p.globalVars.THREE.Vector3()).multiplyScalar(300);
                let image = 'https://images-na.ssl-images-amazon.com/images/I/91ovrqFkzkL._RI_SX200_.jpg';
                const name =  'new_poster_' + Math.floor(Math.random() * 10000);
                const newObj = p.pl.createPoster3D( v.panorama, image, Object.values(pos), { name } );
                const objectData = {
                    name,
                    image,
                    pos
                }
                p.setCurrentObjectData(objectData);
                p.setCurrentObject3D(newObj);
                const currentWorldOptions = Object.assign( {}, p.worldOptions );
                currentWorldOptions.hotspots.push(objectData);
                p.setWorldOptions(currentWorldOptions);
            },
            group: 'editmode'
        });


    }
    useEffect(() => {
        initWidgets()
    }, [])

  // its all vanilla js, connecting with panolens. No HTML
  return (
    null
  );
}

export default Widgets;
