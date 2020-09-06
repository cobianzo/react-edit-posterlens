var data = {
  "minAzimuthAngle": -1.9,  // right turn limit
  "maxAzimuthAngle": -0.1,
  "autoRotate": true,
  "initialLookAt": [
    4988.74,
    -208.76,
    -58.29
  ],
  "worlds": [
    {
      "panorama": "posterlens/assets/tesim-pano-hall-v4.jpg",
      "name": "Hall",
      "innerPanorama": {
        "offset": [
          100,
          0,
          0
        ]
      },
      "hotspots": [
        {
          "type": "text-3d",
          "text": "+Because neightbour matters !! ",
          "pos": [
            200,
            -61.36,
            -47.9
          ],
          "scale": 0.3,
          "size": 200,
          "name": "bigtext",
          "fontFamily": 'posterlens/assets/fonts/Century_Gothic_Regular.js' 
        }
      ]
    }
  ]
}