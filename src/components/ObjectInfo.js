import React from 'react'
import {round2} from '../helpers';
export default function ObjectInfo(p) {
    // info in a panel of the object. Gets updated when the currentObject3D updates. It means , when it's clicked for instance.
    function currentObjectOptions() {
        if (!p.currentObject3D) return;
        const worldParams = p.getCurrentPanoramaParams();
        let objectOptions = worldParams.hotspots.find( ht => ht.name === p.currentObject3D?.name );
        return objectOptions;
    }
    function currentObjectOptionsJSX() {
        const objectOptions = currentObjectOptions();
        var exportStr = objectOptions? JSON.stringify(objectOptions, false, 2) : 'no sel';
        var lines = exportStr.split('\n');
        var jsx = [];
        lines.forEach((line, i)=> { jsx.push(line); jsx.push(<br key={'return-'+i} />); } )
        return jsx;
    }
    return (
        <div className='object-info position-absolute'>
            <h4>{p.currentObject3D?.name}<small> ({p.currentObject3D?.type})</small></h4>
            Pos: {round2(p.currentObject3D?.position.x)} {round2(p.currentObject3D?.position.y)} {round2(p.currentObject3D?.position.z)}
            <br/>
            Rot: x {round2(p.currentObject3D?.rotation.x)} / y {round2(p.currentObject3D?.rotation.y)} / z {round2(p.currentObject3D?.rotation.z)}
            { currentObjectOptions()?.alwaysLookatCamera? '(alwayslookatcamera)' : null }
            <br/>
            Scale: {round2(p.currentObject3D?.scale.x)} {round2(p.currentObject3D?.scale.y)} {round2(p.currentObject3D?.scale.z)}
            
            <br/>
            <b>Object Info in options:</b> <br/>
            {currentObjectOptionsJSX() }
        </div>
    )
}
