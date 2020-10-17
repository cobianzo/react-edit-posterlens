import React, { useState, useEffect, useRef } from 'react'

import InputObject3D from './InputObject3D';


function InputsRotation( p ) {

    /** reuse of code by holding the props to export into one var. */
    const props = {
        getCurrentPanoramaParams: p.getCurrentPanoramaParams,
        currentObject3D: p.currentObject3D, setCurrentObject3D: p.setCurrentObject3D, selectObject: p.selectObject,
        getOptionsByObject3D: p.getOptionsByObject3D, 
        setPlOptions: p.setPlOptions,
        plOptionsReplaceWorldParamsHotspot: p.plOptionsReplaceWorldParamsHotspot,
        class: 'col-4 flex-nowrap'
    }


    return (
        <div className={ p.class?? 'nothing' }>
            <InputObject3D input={ {
                                label: 'RotX',
                                prop: 'rotation.x',
                                field: 'rot.0',
                                default: [],
                                min: - Math.PI,
                                max: Math.PI,
                                step: 0.01
                            } } 
                            props={props}
                             />
            
            <InputObject3D input={ {
                                label: 'RotY',
                                prop: 'rotation.y',
                                field: 'rot.1',
                                default: [],
                                min: - Math.PI,
                                max: Math.PI,
                                step: 0.01
                            } }
                            props={props}
                            />

            <InputObject3D input={ {
                            label: 'RotZ',
                            prop: 'rotation.z',
                            field: 'rot.2',
                            default: [],
                            min: - Math.PI,
                            max: Math.PI,
                            step: 0.01
                        } }
                        props={props}
                        />
            <InputObject3D input={ {
                            label: 'Dist',
                            prop: 'distance',
                            field: 'distance',
                            default: [],
                            min: 1,
                            max: 460,
                            step: 1,
                            onChange: ((e) => {
                                // update the object 3d to see the change
                                var currentPos = p.currentObject3D.position.clone().normalize();
                                const newPos = currentPos.multiplyScalar(e.target.value);
                                window.pl.setObjectPos(p.currentObject3D, [newPos.x, newPos.y, newPos.z]);
                            })
                        } }
                        props={props}
                        />
            <InputObject3D input={ {
                            label: 'Scale',
                            prop: 'scale.x',
                            field: 'scale',
                            default: [],
                            min: p.currentObject3D.type === 'pl_text-3d'? 0.01 : 1,
                            max: p.currentObject3D.type === 'pl_text-3d'? 3 : (p.currentObject3D.isSprite? 400 : 100),
                            step: p.currentObject3D.type === 'pl_text-3d'? 0.01 : 1,
                            onChange: ((e) => {
                                // update the object 3d to see the change
                                p.currentObject3D.scale.x = e.target.value;
                                p.currentObject3D.scale.y = e.target.value;
                                p.currentObject3D.scale.z = e.target.value;
                                // SyncInputFieldset__DataHotspot( p.currentObject3D.name, { 'scale': e.target.value }, true, props);
                                return false;
                            }),
                           // onMouseUp: ( e => { return false; } )
                        } }
                        props={props}
                        />
            
        </div>
    )
}
export default InputsRotation
