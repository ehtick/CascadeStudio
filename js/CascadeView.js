var Environment = function (goldenContainer) {
    this.time = new THREE.Clock();
    this.time.autoStart = true;
    this.lastTimeRendered = 0.0;
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 2000); //new THREE.OrthographicCamera(300 / - 2, 300 / 2, 300 / 2, 300 / - 2, 1, 1000);
    this.scene = new THREE.Scene();
    this.isVisible = true;
    this.viewDirty = true; 
    this.goldenContainer = goldenContainer;
  
    this.initEnvironment = function () {
      this.camera.position.set(50, 100, 150);
      this.camera.lookAt(0, 45, 0);
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xffffff);//0xa0a0a0
      this.scene.fog = new THREE.Fog(0xffffff, 200, 600);//0xa0a0a0
  
      var light = new THREE.HemisphereLight(0xffffff, 0x444444);
      light.position.set(0, 200, 0);
      this.light2 = new THREE.DirectionalLight(0xbbbbbb);
      this.light2.position.set(0, 200, 100);
      this.light2.castShadow = true;
      this.light2.shadow.camera.top = 180;
      this.light2.shadow.camera.bottom = - 100;
      this.light2.shadow.camera.left = - 120;
      this.light2.shadow.camera.right = 120;
      this.scene.add(light);
      this.scene.add(this.light2);
      //scene.add(new THREE.CameraHelper(light.shadow.camera));
      this.groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000),
                                       new THREE.MeshPhongMaterial  ({ color: 0x999999, depthWrite: false }));
      this.groundMesh.rotation.x = - Math.PI / 2;
      this.groundMesh.receiveShadow = true;
      this.scene.add(this.groundMesh);
      var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
      grid.material.opacity = 0.3;
      grid.material.transparent = true;
      this.scene.add(grid);
  
      var curCanvas = document.createElement('canvas');
      //curCanvas.id = canvasId;
      //document.currentScript.parentNode.insertBefore(curCanvas, document.currentScript.nextSibling);
      goldenContainer.getElement().get(0).appendChild(curCanvas);
      this.renderer = new THREE.WebGLRenderer({ canvas: curCanvas, antialias: true });
      this.renderer.setPixelRatio(1);
      var parentWidth  = this.goldenContainer.width;
      let parentHeight = this.goldenContainer.height;
      this.renderer.setSize(parentWidth, parentHeight);
      this.renderer.shadowMap.enabled = true;
      this.camera.aspect = parentWidth / parentHeight;
      this.camera.updateProjectionMatrix();

      this.goldenContainer.on('resize', this.onWindowResize.bind(this));
  
      this.draggableObjects = [this.ludic];
      //this.dragControls = new THREE.DragControls(this.draggableObjects, this.camera, this.renderer.domElement);
  
      //if (this.orbit) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 45, 0);
        this.controls.panSpeed = 2;
        this.controls.zoomSpeed = 1;
        this.controls.screenSpacePanning = true;
        this.controls.update();
        this.controls.addEventListener('change', () => this.viewDirty = true);
        //this.dragControls.addEventListener('dragstart', (data) => { this.controls.enabled = false;  data.object._isDragging = true; });
        //this.dragControls.addEventListener('dragend', (data) => { this.controls.enabled = true; data.object._isDragging = false; });
      //}
      //this.dragControls.addEventListener('drag', () => this.viewDirty = true);
    }

    this.onWindowResize = function () {
        this.camera.aspect  = this.goldenContainer.width / this.goldenContainer.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.goldenContainer.width, this.goldenContainer.height);
        this.renderer.render(this.scene, this.camera);
    }
  
    this.initEnvironment();
  }
  
  var CascadeEnvironment = function (goldenContainer) {
    this.goldenContainer = goldenContainer;
    this.environment = new Environment(this.goldenContainer);
    this.updating = false;
  
    this.boxGeometry = new THREE.BoxBufferGeometry(100, 100, 100);
    this.white       = new THREE.MeshLambertMaterial({ color: 0x888888 });
  
    this.initArm = function () {

      this.goldenContainer.layoutManager.eventHub.on('poseUpdate', (data) => this.setArmAngles(data));
      this.goldenContainer.layoutManager.eventHub.emit('Start');
    }
  
    this.animate = function animatethis() {
      requestAnimationFrame(() => this.animate());
      this.goldenContainer.layoutManager.eventHub.emit('Update');
      this.environment.renderer.render(this.environment.scene, this.environment.camera);
    };
  
    this.initArm();
    this.animate();
    // Initialize the view in-case we're lazy rendering...
    this.environment.renderer.render(this.environment.scene, this.environment.camera);
  }