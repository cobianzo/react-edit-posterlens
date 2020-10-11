import React, {useState} from 'react'
/**
 * WHAT:    Shows a panel with the config data of the current Panorama.
 * WHERE:   Top Right of the screen in absolute position, semiyellow bg panel.
 * WHEN:    Shown when there is no object selected only. 
 */
export default function PanelPanoramaInfo_Right(p) {

    // State
    const [isOpen, setIsOpen] = useState(p.editParams.isExpertMode);

    // info in a panel of the panorama.
    function currentPanoOptions() {
        const worldParams = p.getCurrentPanoramaParams();
        if (!worldParams) return;
        let objectOptions = {... worldParams }
        delete(objectOptions.hotspots)
        return objectOptions;
    }
    // transform the info in JSX to render it as text.
    function currentPanoOptionsJSX() {
        const objectOptions = currentPanoOptions();
        var exportStr = objectOptions? JSON.stringify(objectOptions, false, 2) : 'no sel';
        var lines = exportStr.split('\n');
        var jsx = [];
        lines.forEach((line, i)=> { jsx.push(line); jsx.push(<br key={'return-'+i} />); } )
        return jsx;
    }

    // THAT's it. Lets render.
    return (
        <div className='object-info position-absolute' onClick={ () => setIsOpen(!isOpen) }>
            <div className={ isOpen? 'd-block' : 'd-none' }>            
                <React.Fragment>
                    <br/>
                    <b>Panorama in options:</b> <br/>
                    {currentPanoOptionsJSX() }
                </React.Fragment>
            </div>
        </div>
    )
}
