import React, {useState} from 'react'
import {round2} from '../../helpers';

export default function PanelObjectData_Right( p ) {

    // State. We can minimize the panel with onclick
    const [isOpen, setIsOpen] = useState(p.editParams.isExpertMode);

    // info in a panel of the object. Gets updated when the currentObject3D updates. It means , when it's clicked for instance.
    function currentObjectOptions() {
        if (!p.currentObject3D) return;
        const worldParams = p.getCurrentPanoramaParams();
        if (!worldParams) return;
        let objectOptions = worldParams.hotspots.find( ht => ht.name === p.currentObject3D?.name );
        return objectOptions;
    }
    // transform the info in JSX to render it as text.
    function currentObjectOptionsJSX() {
        const objectOptions = currentObjectOptions();
        var exportStr = objectOptions? JSON.stringify(objectOptions, false, 2) : 'no sel';
        var lines = exportStr.split('\n');
        var jsx = [];
        lines.forEach((line, i)=> { jsx.push(line); jsx.push(<br key={'return-'+i} />); } )
        return jsx;
    }

    // THAT's it. Lets render.
    return (
        <div className='object-info position-absolute' onClick={ () => setIsOpen(!isOpen) }>
            <h4>{p.currentObject3D?.name}<small> ({p.currentObject3D?.type})</small></h4>

            <div className={ isOpen? 'd-block' : 'd-none' }>
                
                Pos: {round2(p.currentObject3D?.position.x)} {round2(p.currentObject3D?.position.y)} {round2(p.currentObject3D?.position.z)}
                <br/>
                Rot: x {round2(p.currentObject3D?.rotation.x)} / y {round2(p.currentObject3D?.rotation.y)} / z {round2(p.currentObject3D?.rotation.z)}
                { currentObjectOptions()?.alwaysLookatCamera? '(alwayslookatcamera)' : null }
                <br/>
                Scale: {round2(p.currentObject3D?.scale.x)} {round2(p.currentObject3D?.scale.y)} {round2(p.currentObject3D?.scale.z)}
            
            
                <React.Fragment>
                <br/>
                <b>Object Info in options:</b> <br/>
                {currentObjectOptionsJSX() }
                </React.Fragment>
            </div>
        </div>
    )

}
