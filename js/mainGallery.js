/*

HEIGHTMAP VISUALISATION

TODO:

[!] dat.gui.js
[!] resolution

    KEEP IN MIND THAT 1024 x 1024 is over a million of pixel,
    so terrain with size over 1 million pixels could be generated 
    10-20 minutes.
    
    It could be also set and 'hard-wired' @ index.html
    Iconcontroller('img_front', 512, 512, 1);

[x] UP / DOWN
[x] bird's view (orphographic)
[x] combined camera (change modes)
[x] mouse dragging (left-click]

[-] model popup with X [close] button
    https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_modal

FIXES
[-] hardwiring camera positions
[-] take back DAT.GUI (unhide)

[-] planned, [x] done, [!] please read comments

27.07.2017

[x] In first person view, we must have character controller (collision) enabled. such that we have 
    the camera game object walking on the ground and not flying through the terrain grounds.
    
    FirstPersonControls.js 
    add collisionDetection() function true/false
    
[x] The rotation right now is click based. wherein you click to the right for camera to rotate 
    to right and so on. we need it to be drag based. like it is in the reference exe. (in the reference exe 
    it is simply mouse move based. we would need mouse press + move)
    
[x] We need you to make input heightmap resolution 225X225 instead of 1024X1024. Rather what would be easier 
    is if we    have an input field where we can specify resolution. So that it is modifiable as per input image.
    
    init(texture, 225); second variable is for desired image size
    
[!] Also another issue we are facing is the generated terrain doesnt really create depths in regions which 
    are dark. 

    For example, this image. the dark regions were supposed to become depressions in the terrain, however those 
    regions apply as color on top.
    
    Hari R: don't fret on point 4 then
    Hari R: its looking similar in the unity build
    
REFERENCES:
https://github.com/mrdoob/three.js/blob/master/examples/canvas_camera_orthographic2.html

@author Vladimir V. KUCHINOV
@email  helloworld@vkuchinov.co.uk

*/

var cameraSettings = { orpho: {
    
                    position: new THREE.Vector3(-381.22820643915037, 177.80860702575183, 255.8699584081212),
                    rotation: new THREE.Vector3(-0.7653081099207683, -0.7083138768227595, -0.5585462700094632),
                    top: 2887.0400210827233,
                    left: -7030.332591879822,
                    bottom: -2887.0400210827233,
                    right: 7030.332591879822,
    
                    target:  new THREE.Vector3(0.0, 0.0, 0.0)
    
                    },
                    persp: {

                    }
};

var scaleFactor = 2;

var gui;

var Interface = function() {
    
    this.heightDeltaRatio = 1.0;
    this.mapLog = false;
    this.updateIt = function() { updateGeometry(gui.__controllers[0], gui.__controllers[1]); };
    
    
};
 
window.onload = function() {
    
    var ui = new Interface();
    gui = new dat.GUI( { width: 360 } );
    gui.add(ui, "heightDeltaRatio", 0.1, 2.0, 0.1);
    gui.add(ui, "mapLog");
    gui.add(ui, 'updateIt');
    
    $(gui.domElement).attr("hidden", true);
    
};

var mapping = { min: 1E-3, max: 255.0 };

var container, stats;

var geomertry, plane, colors = [];

var camera, controls, scene, renderer;
var clock = new THREE.Clock();

var loader = new THREE.TextureLoader();

$( document ).ready(function() {
    
    var gallerySize = 6;

        //https://stackoverflow.com/questions/9684799/how-do-i-prevent-stop-or-kill-javascript-function
        //$("#modalClose").click(function(e) { location.reload(); } );
        //window.removeEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange ); 
    
        for(var i = 1; i <= gallerySize; i++){

            $("#0" + i).click(function(e) { 

                $("#modalClose").click(function(e) { $("#modalThree").css("display","none"); $( "#group" ).show(); resetThree(); });

                $("#modalThree").css("display","block");
                
                $( "#group" ).hide();
        
                loader.load(

                        $(this).attr("src") ,

                        function ( texture ) {

                        init(texture, 225);  

                        },
                        function ( xhr ) {
                            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                        },

                        function ( xhr ) {
                            console.log( 'An error happened' );
                        }
                );
                                
            });    
                
        }
        
    });
    

function resetThree(){
    
    $("#container").empty(); 
    controls.dispose(); 

}

function rescaleImageData ( image_ , size_ ) {
    
    var canvas = document.createElement( 'canvas' );
    canvas.width = size_;
    canvas.height = size_;

    var context = canvas.getContext( '2d' );
    context.drawImage( image_, 0, 0, canvas.width, canvas.height );

    return context.getImageData( 0, 0, canvas.width, canvas.height );
    
}

function getImageData( image_ ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image_.width;
    canvas.height = image_.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image_, 0, 0 );

    return context.getImageData( 0, 0, image_.width, image_.height );

}

function getPixel(image_, x_, y_ ) {

    var data = image_.data;
    var position = ( x_ + image_.width * y_ ) * 4;
    
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

}

function RGBtoGrayscale(rgb_){ return Math.floor((Number(rgb_.r) + Number(rgb_.g) + Number(rgb_.b)) / 3.0); }


function map(value_, oldMin_, oldMax_, newMin_, newMax_) {
    
  var newValue = newMin_ + (value_ - oldMin_) / (oldMax_ - oldMin_) * (newMax_ - newMin_);
  return newValue;
    
};

function mapLog(value_, oldMin_, oldMax_, newMin_, newMax_) {
    
  newMin_ = Math.log(newMin_);
  newMax_ = Math.log(newMax_);
    
  return Math.exp(newMin_ + (newMax_ - newMin_) * ((value_ - oldMin_) / (oldMax_ - oldMin_)));
    
}


function updateGeometry(param0_, param1_){
    
}

function customPlane(texture_, width_, height_, size_){
    
    var data = rescaleImageData(texture_.image, size_ );
    //var data = getImageData(texture_.image);
        
    var widthSegments_ = size_;
    var heightSegments_ = size_;
    
    geometry = new THREE.Geometry();
    
    var step = { x: width_ / widthSegments_, z: height_ / heightSegments_ };
     
    for(var z = 0, h = heightSegments_; z < h; z++){
        for(var x = 0, w = widthSegments_; x < w; x++){
            
           //exponential mapping
           //var customY = - 2 * mapLog(RGBtoGrayscale(getPixel(data, z, x)) + 1E-3, 255.0, 1E-3, mapping.min, mapping.max);
            
           //linear mapping
           var customY = -map(RGBtoGrayscale(getPixel(data, z, x)) + 1E-3, 255.0, 1E-3, mapping.min, mapping.max);
           geometry.vertices.push(new THREE.Vector3(-width_ / 2 + x * step.x, customY, - height_ / 2 + z * step.z));
            
           var c = RGBtoGrayscale(getPixel(data, z, x));
           //console.log(c);
           //var c1 = [40, 40, 100];
           //var c2 = [160, 240, 240];
           colors.push(new THREE.Color("rgb(" + Math.floor(map(c, 0, 255, 40, 160)) + "," + Math.floor(map(c, 0, 255, 40, 240)) + "," + Math.floor(map(c, 0, 100, 100, 240)) + ")"));
            
        }
    }
    

    for(var z = 0, h = heightSegments_ - 1; z < h; z++){
        for(var x = 0, w = widthSegments_ - 1; x < w; x++){

            var zIndex = z * heightSegments_;
            var nextZIndex = (z + 1) * heightSegments_;
            
            var faceA = new THREE.Face3(zIndex + x, nextZIndex + x + 1,  zIndex + x + 1);
            faceA.vertexColors[0] = colors[zIndex + x];
            faceA.vertexColors[1] = colors[nextZIndex + x + 1];
            faceA.vertexColors[2] = colors[zIndex + x + 1];
            
            geometry.faces.push(faceA);
            
            var faceB = new THREE.Face3(zIndex + x, nextZIndex + x, nextZIndex + x + 1);
            faceB.vertexColors[0] = colors[zIndex + x];
            faceB.vertexColors[1] = colors[nextZIndex + x];
            faceB.vertexColors[2] = colors[nextZIndex + x + 1];
            
            geometry.faces.push(faceB);
        }
    }
    
    return geometry;
    
}

function init(texture_, size_) {

    var divWidth = $("#content").width() * 1.92;
    var divHeight= $("#content").height() * 1.975;
    
    console.log(divWidth + " " + divHeight);
    
    container = document.getElementById( 'container' );

    //( width, height, fov, near, far, orthoNear, orthoFar ) {
    camera = new THREE.CombinedCamera( divWidth / 2, divHeight / 2, 60, 1, 10000, -10000, 10000 );
    camera.lookAt( new THREE.Vector3(0.0, 0.0, 0.0) );
    
    scene = new THREE.Scene();
    controls = new THREE.FirstPersonControls( camera );
    controls.movementSpeed = 1200;
    controls.lookSpeed = 0.1;
    
    controls.lat = -22.571792000000166;
    controls.lon = -151.3089374999999;
    controls.phi = 1.9647484152702153;
    controls.thera = -2.640839147069316;
    
    camera.lookAt(controls.target);
    
    //plane
    var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    var geometry = customPlane(texture_, 5120, 5120, size_);

    //geometry.verticesNeedUpdate = true;
    //geometry.normalsNeedUpdate = true;
    
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    
    plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;

    scene.add(plane);
    
    
    $( "#loading" ).hide();
    console.log("Done");
    
    var geo = new THREE.SphereGeometry( 5, 32, 32 );
    var mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sphere = new THREE.Mesh( geo, mat );
    sphere.position.add(geometry.vertices[0]);
    scene.add( sphere );
    
    camera.position.y = 250;
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xDEDEDE );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( divWidth / 2 , divHeight / 2 );
    container.innerHTML = "";
    container.appendChild( renderer.domElement );

    //window.addEventListener( 'resize', onWindowResize, false );
    //window.removeEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange );

    animate();
    
}

function onWindowResize() {
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
    
}

function changeCameraMode(mode_){

    var s = "first person";
    if(mode_) { s = "birds view"; } 
    
    //false: first view, true: bird's eye
    console.log("mode: " + s);
    
    if(mode_) { camera.toOrthographic(); 
              
    controls.lat = -16.62519350000002;  
    controls.lon =  -36.71235175000004; 
    controls.phi =  1.8609606921510569;
    controls.theta =  -0.6407514141878028;
               
    camera.lookAt(controls.target);
               
    } 
    
    else { 
 
    camera.toPerspective(); 
    
    controls.lat = -22.571792000000166;
    controls.lon = -151.3089374999999;
    controls.phi = 1.9647484152702153;
    controls.thera = -2.640839147069316;
    
    camera.lookAt(controls.target);
        
    }

}

function animate() {
    
    requestAnimationFrame( animate );
    render();

}

function render() {

    controls.collisionDetection(camera, plane);
    controls.update( clock.getDelta() );
    renderer.render( scene, camera );
    
}