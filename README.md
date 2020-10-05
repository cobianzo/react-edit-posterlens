Brief: This is a widget that creates an UI to edit the panoramas created with posterlens (over panolens).  
Its goal is to export the options config data object, used when we call posterlens for a virtual tour.

TODO:       
When selecting an object, init the value of all inputs with the Object data.

# To install and run this project
===  
> git clone git@github.com:cobianzo/react-edit-posterlens.git 
> cd react-edit-posterlens  
-- I dont know why the submodules didnt work last time, but in theory:
> git submodule init  
> git submodule update  
> npm i  
> yarn start   

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. (if it doesn open by itself)

# Communication outside ===> this react app  
===  
from outside to this app:  
- Using window vars
    - window.plImgPath
    - window.basePath
    - window.onSavePlOptionsCallback(plOpts) <== We can use this fn to export the value of the posterlens options js object

# Communication this react app ===> outside  
=== 
- using localStorage
    - `pl.o` <-- THE MOST IMPORTANT: this is what we export.
- using window vars
    - window.pl : 
    - window.lastSelectedObj : 


# To edit this project
===  
Quick start:          
- start at public/index.html
    - It calls the plugin posterlens, which calls the plugin panolens, which is contructed using the library THREE.js  
- then the App 'Edit' starts in `App.js`, with the main functionalities in 'EditObject.js'
- Data structure as follows:
    - we can update the data of the panorama by modifying an object in the viewer (drag and drop, scaling, rotating). That info is saved in state:  
        - currentObject3D, which calls and copy that info into currentObjectData.
    - or, we can update the data by editing the inputs in the panel. That info is saved in state:
        - currentObjectData
    - When we modify something , we update the `plOptions`.
        - worldOptions is used when exporting the configuration of the panorama, representing the state of what you see in the viewer.

# Important notes  
===  
Don't try to understand this project without understanding before posterlens (public/posterlens/posterlens.js).  
The aim of this react project is to load a posterlens panorama, and create an 'Edit' mode, that allows to drag and drop the 3d objects, and the export the options.  
Posterlens uses Panolens, and it' purely javascript. So this React project is not a typical projec with html templates, because the 'view' is the Panolens panorama, which created and accessed only by js.  

# More things for a developer  
===  
We create the panorama in index.html. There we import all the libraries as js scripts (not modules).  
The libraries are in /public/posterlens  
So, React complains about THREE object not being defined. For that, we created state globalVars, initialized to vars that come from outside React. I used `eval` for that, sorry.  




This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
