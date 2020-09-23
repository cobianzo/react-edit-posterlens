import React, {useState, useEffect} from 'react'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'

export default function ListObjects(p) {
    const [init, setInit] = useState(null);
    useEffect(() => {
        console.log('🚴🏼‍♀️Hello from ListObjects')
        setInit(p.getCurrentPanoramaParams());
    }, [p.plOptions])

    const getObjectsShowWhenVisible = function() {
        if (!window.pl) return 'not loaded';
        if (!window.pl.viewer.panorama.objectsToPopupWhenVisible) return 'none';
        const jsx = <div> {Object.keys(window.pl.viewer.panorama.objectsToPopupWhenVisible).map( k=>{
            const [min,max] = window.pl.viewer.panorama.objectsToPopupWhenVisible[k];
            return <p key={k}>{k} : {min}º, {max}º</p>;
        })} </div>
        return jsx;
    }
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

           <br/> { /** curiously this works, I dont need to use any State, it works ok with the pl object fn. 
                    *    It is because of the mousemove event in App.js. It makes recalculate this component aparently
                    */}
            { p.editParams.isExpertMode? <React.Fragment>
                Camera: { window.pl? window.pl.getCameraDirection('lookatPoint').join(', ')  : null }
                <br/>
                Angle: { window.pl? Math.round(window.pl.getCameraDirection('rad') * 100)/100 : null }
                    rad :: { window.pl? Math.round(window.pl.getCameraDirection('deg')) : null }º
                    <br/>
                    Fov: { window.pl? window.pl.viewer.camera.fov : null }
                    <br/>
                    MousePos: { p.editParams.currentMouse3DPosition.join(', ') }
                    <br/>
                    <br/>
                    <i>panorama.objectsToPopupWhenVisible:</i> { init? getObjectsShowWhenVisible() : null }
            </React.Fragment> : null }
        </Col>
    )
}
