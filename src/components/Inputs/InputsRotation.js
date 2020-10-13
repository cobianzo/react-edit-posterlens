import React, { useState, useEffect, useRef } from 'react'

import InputObject3D from './InputObject3D';
import { SyncObject3d__DataHotspot } from '../SyncDataAlongApp'

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';


function InputsRotation( p ) {

    /** reuse of code by holding the props to export into one var. */
    const props = {
        getCurrentPanoramaParams: p.getCurrentPanoramaParams,
        currentObject3D: p.currentObject3D,
        getOptionsByObject3D: p.getOptionsByObject3D, 
        setPlOptions: p.setPlOptions,
        plOptionsReplaceWorldParamsHotspot: p.plOptionsReplaceWorldParamsHotspot,
        class: 'col-4 flex-nowrap'
    }
    return (
        <div className={ p.class?? 'ww' }>
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
                            max: 499,
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
                            max: p.currentObject3D.type === 'pl_text-3d'? 3 : 100,
                            step: p.currentObject3D.type === 'pl_text-3d'? 0.01 : 1,
                            onChange: ((e) => {
                                // update the object 3d to see the change
                                p.currentObject3D.scale.set( e.target.value,e.target.value,e.target.value );
                            })
                        } }
                        props={props}
                        />
            
        </div>
    )
}
export default InputsRotation
