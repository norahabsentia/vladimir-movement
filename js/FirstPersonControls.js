/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

/*

cameraMode goes false until keyUp

*/

THREE.FirstPersonControls = function ( object, domElement ) {

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.enabled = true;

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.cameraMode = false;
    this.enterPressed = false;
    this.camera = false;
    
    var INTERSECTED;
    this.raycaster = new THREE.Raycaster();
    this.collision = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', - 1 );

	}

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

         if ( this.domElement === document ) {

            this.mouseX = event.pageX - this.viewHalfX;
            this.mouseY = event.pageY - this.viewHalfY;

        } else {

            this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
            this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

        }
    
		this.mouseDragOn = true;

	};

    this.onMouseMove = function ( event ) {

        var speedX = 0, speedY = 0;
        if(this.mouseDragOn) { 
         if ( this.domElement === document ) {

            this.mouseX = event.pageX - this.viewHalfX;
            this.mouseY = event.pageY - this.viewHalfY;

        } else {

            this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
            this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

        }
    
        speedX = this.mouseX / 512.0;
        speedY = this.mouseY / 512.0;

        this.lon += speedX;
        this.lat -= speedY;
            
		//console.log(this.mouseX + " " + this.mouseY);
            
        }

	};

    
	this.onMouseUp = function ( event ) {

        event.preventDefault();
        event.stopPropagation();

		this.mouseDragOn = false;

	};

	this.onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: /*up*/ this.moveUp = true; break;
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/ this.moveDown = true; break;
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

            case 13: /*ENTER*/ this.cameraMode = true; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch ( event.keyCode ) {

			case 38: /*up*/ this.moveUp = false; break;
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/ this.moveDown = false; break;
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

            case 13: /*ENTER*/ this.cameraMode = false; this.enterPressed = false;  break;

		}

	};

	this.update = function( delta ) {

		if ( this.enabled === false ) return;

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;

        
		if ( this.moveForward || ( this.autoForward && ! this.moveBackward )) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward) this.object.translateZ( actualMoveSpeed );

		if ( this.moveLeft) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight) this.object.translateX( actualMoveSpeed );

		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) if(!this.collision) { this.object.translateY( - actualMoveSpeed ); }
        
        //

        if ( this.cameraMode && this.enterPressed == false ) { this.camera = this.camera ? false : true; changeCameraMode(this.camera); this.enterPressed = true; }
        
		var actualLookSpeed = delta * this.lookSpeed;

		if ( ! this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		if(this.mouseDragOn) { 
            
            //this.lon += this.mouseX * actualLookSpeed; 
                             
        }
        
		if ( this.lookVertical && this.mouseDragOn ) { 
            
            //this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
            
        }

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );

	};

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function() {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
		this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );
        this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );

		window.removeEventListener( 'keydown', _onKeyDown, false );
		window.removeEventListener( 'keyup', _onKeyUp, false );

	};
    
    this.collisionDetection = function(camera_, terrain_){
        
        this.raycaster.setFromCamera( camera.position , camera.cameraP);
 
        var intersects = this.raycaster.intersectObjects( scene.children );

				if ( intersects.length > 0 ) {

					if ( INTERSECTED != intersects[ 0 ].object ) {

				    this.collision = true;
                        
					}

				} else {

					 this.collision = false; 
				}
       
        
    }

	var _onMouseDown = bind( this, this.onMouseDown );
	var _onMouseUp = bind( this, this.onMouseUp );
    var _onMouseMove = bind( this, this.onMouseMove );
	var _onKeyDown = bind( this, this.onKeyDown );
	var _onKeyUp = bind( this, this.onKeyUp );

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', _onMouseUp, false );
    this.domElement.addEventListener( 'mousemove', _onMouseMove, false );

	window.addEventListener( 'keydown', _onKeyDown, false );
	window.addEventListener( 'keyup', _onKeyUp, false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	}

	this.handleResize();

};
