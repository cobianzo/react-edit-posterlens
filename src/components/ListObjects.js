import React, {useState, useEffect} from 'react'


import Col from 'react-bootstrap/Col'

export default function ListObjects(p) {
    const [init, setInit] = useState(null);
    useEffect(() => {
        console.log('🚴🏼‍♀️Hello from ListObjects')
        setInit(p.getCurrentPanoramaParams());
    }, [p.plOptions])
    return (
        <Col className='list-objects' sm='2'>
            List Hotposts in Pano Options
            {init && p.plOptions?.worlds ? 
            <ul>
                { init.hotspots.map((element,i) => {
                    return <li key={i} onClick={ () => {
                        // get object 3d
                        const theObj = window.pl.getObjectByName(element.name);
                        p.selectObject(theObj);
                    }} className={ (p.currentObject3D?.name === element.name )? 'active' : '' }>
                        {element.name} <small>{element.type}</small>
                    </li>
                })}
            </ul>
            : null }
        </Col>
    )
}
