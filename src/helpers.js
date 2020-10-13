export function round2(fl) { 
    var numb = fl;
    if (typeof numb === 'number')
     numb = numb.toFixed(2);
    return numb;
    //return 0.001;
 }

// x,y,z of mouse inside the 3d world. posterlens has this functions, but it doesnt work if I call it in onmousemove.
export function reactGetMouse3Dposition(event, p ) {
    /* { setEditParams, editParams } */
    if (!window.pl) return
    const v = window.pl.viewer;
    if (!v) { console.warn('Cant retrieve mouse pos, not viewer defined'); return; }

    const intersects = v.raycaster.intersectObject( v.panorama, true );
    if ( intersects.length <= 0 ) return;
    let i = 0;
    while ( i < intersects.length ) {
        if (intersects[i].object.name === 'invisibleWorld') {
            const point = intersects[i].point.clone();
            const world = v.panorama.getWorldPosition( new window.THREE.Vector3() );
            point.sub( world );
            const currentMP = [ Math.round(point.x.toFixed(2)/2), Math.round(point.y.toFixed(2)/2), Math.round(point.z.toFixed(2)/2) ];
            p.setEditParams( Object.assign( {}, p.editParams, { currentMouse3DPosition: currentMP } ) );
            return currentMP;        
            
        }
        i++;
    }
  }
  