import React from 'react'

import Row from 'react-bootstrap/Row'

/**
 * The div placeholder where posterlens.js loads the threejs panolens panorama
 */
function CanvasUI3D( p ) {
    return (
        <Row>
          <div className='w-100' onMouseMove={ event => { p.reactGetMouse3Dposition(event); } }>
           <div  id={p.editParams.POSTERLENS_CONTAINER_ID} className='posterlens-container'></div>
          </div>
        </Row>
    )
}

export default CanvasUI3D
