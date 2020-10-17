import React, {useState, useEffect} from 'react'

import Col from 'react-bootstrap/Col'


export default function PanelListObjects_Left( p ) {

    // init is the current pano params, where we grab the objects to show (hotspots)
    const [init, setInit] = useState(null);
    const [allUnblocked, setAllUnblocked] = useState(false);

    useEffect(() => {
        console.log('🚴🏼‍♀️Hello from PanelListObjects_Left')
        setInit(p.getCurrentPanoramaParams());
    }, [p.plOptions])

    const handleLockUnlockEl = function(el) {                   
        const theObj = window.pl.getObjectByName(el.name);
        if (theObj) {
            el.isBlocked = theObj.isBlocked = !el.isBlocked;
            theObj.material.blending = el.isBlocked? 3 : 1;
        }
    }
    const handleLockUnlockAll = function(e) {
        if (  ! init || ! init.hotspots ) return false;
        const unlockAll = !allUnblocked;

        if (unlockAll) {
            init.hotspots.forEach((element,i) => {
                element.isBlockedBackup = element.isBlocked;
                const theObj = window.pl.getObjectByName(element.name);
                element.isBlocked = false; 
                if (theObj) {
                    theObj.isBlocked = false;
                    theObj.material.blending = 1;
                }
            });
        } else {
            init.hotspots.forEach((element,i) => {
                element.isBlocked = element.isBlockedBackup;
                const theObj = window.pl.getObjectByName(element.name);
                if (element.isBlocked) {
                    theObj.material.blending = 3;
                    theObj.isBlocked = true;
                }
            });
        }
        setAllUnblocked(unlockAll);
        return false
    }


    // more info for developers. Option popup when visible for an object.
    const getObjectsShowWhenVisible = function() {
        if (!window.pl) return 'not loaded';
        if (!window.pl.viewer.panorama.objectsToPopupWhenVisible) return 'none';
        const jsx = <div> {Object.keys(window.pl.viewer.panorama.objectsToPopupWhenVisible).map( k=>{
            const [min,max] = window.pl.viewer.panorama.objectsToPopupWhenVisible[k];
            return <p key={k}>{k} : {min}º, {max}º</p>;
        })} </div>
        return jsx;
    }
    const elementIcon = function(el) {
        if (el.isBlocked) return <span>🔑</span>;
        if (el.type === 'text-3d') return <span>𝔸</span>;
        if (el.type === 'text-2d') return <span>𝐴</span>;
        return <span>🍞</span>;
    }
    return (
        <Col className={ (allUnblocked? 'all-unblocked ' : '') + 'list-objects' } sm='2'>
            List Hotposts in Pano Options
            <button className={ (allUnblocked? 'btn-danger' : 'btn-primary') + ' btn btn-sm' } 
                    onClick={ (e) => { e.preventDefault(); handleLockUnlockAll(e) }  }>
                {(allUnblocked? 'Activate' : 'Deactivate')} locking objects
            </button>
            {init && p.plOptions?.worlds ? 
            <ul className='list-unstyled'>
                { init.hotspots.map((element,i) => {
                    return <li key={i} className={element.isBlocked? 'is-blocked' : '' } >
                        <div onClick={ e => handleLockUnlockEl(element) }
                             className='float-left mr-3'>{ elementIcon(element) }</div>
                        <div onClick={ () => {
                                // get object 3d
                                const theObj = window.pl.getObjectByName(element.name);
                                p.selectObject(theObj);
                                }} 
                                className={ (p.currentObject3D?.name === element.name )? 'object-selected' : '' } 
                        >
                            {element.name} 
                            <small className='ml-3'>{element.type}</small>
                        </div>
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
