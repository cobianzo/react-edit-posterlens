import React, { useState, useEffect, useRef } from 'react'

import InputObject3D from './InputObject3D';

function InputsRotation( p ) {

    /** reuse of code by holding the props to export into one var. */
    const props = {
        updateObjectSingleData: p.updateObjectSingleData,
        getCurrentPanoramaParams: p.getCurrentPanoramaParams,
        currentObject3D: p.currentObject3D,
        getOptionsByObject3D: p.getOptionsByObject3D,
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
        </div>
    )
}
export default InputsRotation
