    var card=document.getElementById("card"),
        checks=document.getElementById("checks"),
        backgroundImg="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoXUVyz8QOoxzyxBXFAlJy0EpVrSWlEl9obQ&usqp=CAU";
    
        import { OrbitControls } from 'https://unpkg.com/three@0.125.2/examples/jsm/controls/OrbitControls.js';
    import { GLTFLoader } from 'https://unpkg.com/three@0.125.2/examples/jsm/loaders/GLTFLoader.js';

    const scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera( 75,card.offsetWidth / card.offsetHeight, 1, 1000 ),
        renderer = new THREE.WebGLRenderer();
    renderer.setSize(card.offsetWidth , card.offsetHeight );
    card.appendChild( renderer.domElement );

    //change view angle
    camera.position.z = 5;
    camera.position.y = 3;
    camera.position.x = 2;

    var controls = new OrbitControls(camera, renderer.domElement),
        lightA = new THREE.DirectionalLight( 0xffffff, 3),
        lightB = new THREE.DirectionalLight(0xffffff, 3),
        dirLight = new THREE.DirectionalLight( 0xffffff, 3.5 );

    lightB.position.set( -8, -1, 8 );
    lightA.position.set( -8, 12, 8 );
    dirLight.position.set( 0, -5, 0 );

    //set background
    var loader = new THREE.TextureLoader();
    loader.load(backgroundImg , (t)=>scene.background = t);
   

    // Add Light to scene   
    scene.add( dirLight );
    scene.add(lightA);
    scene.add(lightB); 

    // load table model
    var table ,loader = new GLTFLoader();
    loader.load("./table.glb", (box)=>{
        table=box.scene;
        scene.add(table);
        table.rotation.y+=0.1;
        var parts=table.children;
        for(var i=0;i<parts.length;i++){
            console.log(parts[i]['name']);
            createCheckBox(parts[i]['name']);
        }   
        });

    function createCheckBox(name){
        var input=document.createElement("input"),
            txt=document.createTextNode(" "+name+" ");
        input.name='table-part';
        input.type="checkbox";
        checks.appendChild(input);
        checks.appendChild(txt);
    }
    function handleChildren(model){
        var firstChMaterial = model.children[0].material.clone();
        var secondChMaterial = model.children[1].material.clone();
        var thirdChMaterial = model.children[2].material.clone();
        model.children[0].material = firstChMaterial;
        model.children[1].material = secondChMaterial;
        model.children[2].material = thirdChMaterial;
    }
    //change model color 
    var colorVal,
        colorInput=document.getElementById("color");
    colorInput.onchange=function(e){
        colorVal=e.target.value;
        if(table){
            var parts =document.getElementsByName('table-part');
            handleChildren(table);
            for(var i=0;i<parts.length;i++){
                if(parts[i].checked) changeColor(i);
            }    
        }
    }   
    function changeColor(i){
        table.children[i].material.color.set(colorVal);
    }

    var img=document.getElementById("img"),
        file=document.getElementById("file"),
        output=document.getElementById("output");
    file.onchange=openFile.bind(this);
    img.onchange=openFile.bind(this);

    //upload file
    function openFile(file) {
        var input = file.target,
        reader = new FileReader();
        reader.onload = function(){
            var dataURL = reader.result;
            console.log(dataURL);
            var glb=file.target.value.includes(".glb");
            console.log(glb );
            handleChildren(table);
            //replace with model
            if(glb){
                var loader = new GLTFLoader();
                loader.load(dataURL, (box)=>{
                    var model=box.scene;
                    console.log(model.children[0]['name']);
                    replaceChild(0,model.children[0]);
            });
            }  
                //replace with img
            else setImg(dataURL);
        };
        reader.readAsDataURL(input.files[0]);
        output.innerHTML=file.target.value.replace(/^.*[\\\/]/, '');
        
    }

    // change material with img

    function setImg(src)  {
        var texLoader = new THREE.TextureLoader();
        texLoader.load(src, (tex)=>{
            var parts =document.getElementsByName('table-part');
            for(var i=0;i<parts.length;i++){
                if(parts[i].checked) {changeMaterial(i,tex);}
            }    
            
        });
    }
    function changeMaterial(index,val){
        table.children[index].material.map = val;
        table.children[index].material.needsUpdate = true;
    }
    //replace with cupe
    function createCup() {
        const geometry = new THREE.BoxBufferGeometry();
        const material = new THREE.MeshStandardMaterial( { color:colorVal } );   
        const cube = new THREE.Mesh( geometry, material );
        cube.scale.set(2,0.2,2);
        cube.position.y=1.5;
        cube.rotation.y=0.8;
        handleChildren(table);
        replaceChild(0,cube);
        replaceChild(2,cube);
    }

    function replaceChild(index,val){
        table.children[index] = val;
        table.children[index].needsUpdate = true;
    } 

    const animate = function () {
        requestAnimationFrame( animate );
        controls.update();
        // table.rotation.y+=0.01;
        // table.rotation.x+=0.01;
        renderer.render( scene, camera );
    };

    animate();