import React from 'react'
import CryptoJS from "react-native-crypto-js";

/**
 * Panels and Buttons on top of the Canvas3D UI. 
 */

import Row from'react-bootstrap/Row';
import Button from'react-bootstrap/Button';
import PanelObjectData_Right from './PanelObjectData_Right';
import PanelListObjects_Left from './PanelListObjects_Left';
import PanelPanoramaInfo_Right from './PanelPanoramaInfo_Right';

import { SyncPlOptions__LocalStorage } from '../SyncDataAlongApp'

export default function TopBarButtonsAndPanels( p ) {
    

    return (
    <Row className="top-buttons">
        { p.currentObject3D? 
            <PanelObjectData_Right    currentObject3D={p.currentObject3D} getCurrentPanoramaParams={p.getCurrentPanoramaParams} editParams={p.editParams} /> 
            : 
            <PanelPanoramaInfo_Right  currentObject3D={p.currentObject3D} getCurrentPanoramaParams={p.getCurrentPanoramaParams} editParams={p.editParams} /> 
        }
        { p.plOptions?
             <PanelListObjects_Left currentObject3D={p.currentObject3D} plOptions={p.plOptions} selectObject={p.selectObject} editParams={p.editParams}
                                setCurrentObject3D={p.setCurrentObject3D} getCurrentPanoramaParams={p.getCurrentPanoramaParams} /> : null }
        

                <Button className="btn btn-danger btn-sm" onClick={ (e) => { localStorage.removeItem('pl.o'); p.restartViewer(); }  }>
                    Undo changes
                </Button>
        { p.plOptions && p.editParams.isExpertMode ? 
            <React.Fragment>

                <Button className="btn-sm" onClick={ e => p.restartViewer() }>
                    Restart <span className="badge">{p.countRestarts}</span>
                </Button>        
                
            </React.Fragment>
             : null }
        { p.editParams.isExpertMode ? 
            <Button className="btn-secondary ml-5 btn-sm" onClick={ () => p.exportToTextarea() }>
                Export
            </Button> : null }

        { p.currentObject3D?
            <React.Fragment>
                <Button className="btn btn-danger btn-sm" onClick={ p.removeCurrentObject }>
                    Delete
                </Button> 
                <Button className="btn btn-success btn-sm" onClick={ p.cloneCurrentObject }>
                    Clone
                </Button>
                <Button className="btn btn-warning btn-sm" onClick={ ()=> { p.setCurrentObject3D(null); window.lastSelectedObj = null; } }>
                    Unselect
                </Button>
            </React.Fragment> 
            : null }

         <Button variant="outline-secondary btn-sm ml-3" onClick={ (e)=> p.setAppMode('demo') }>
            Demo
        </Button>



        {/* Button to set current view a default view of the pano */}
        <Button variant="primary" className='ml-5 set-camera-view' onClick={ (e)=> {                 
                const currentPanoParams =  p.getCurrentPanoramaParams();
                currentPanoParams.initialLookAt = window.pl.getCameraDirection('lookatPoint');
                currentPanoParams.initialFov = window.pl.viewer.camera.fov;
                const newOptions = p.plOptionsReplaceWorldParams(currentPanoParams);
                SyncPlOptions__LocalStorage(newOptions, p.setPlOptions);
                localStorage.setItem('lastCameraLookat', window.pl.getCameraDirection('lookatPoint'));
                // alert('Initial View of panorama set to current view 👍🏽');
            } }>
            Set camera view
        </Button>
    </Row>)
}
