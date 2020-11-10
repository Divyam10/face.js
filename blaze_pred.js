(function() {
    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        video = document.getElementById('webcam');
    
    navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    
    navigator.getMedia({
        video:{height:230,width:230},
        audio:false
    }, function(stream){
        video.srcObject = stream;
        video.play();
    }, function(error){
        //error.code
    }
    );
    video.addEventListener('play',function()
                          {

        draw(this, context,230,230);
    },false);
    
    async function draw(video,context, width, height)
    {   
        var w = video.videoWidth;
        var h = video.videoHeight;
        console.log(w,h)
        var n = Date.now();
        context.drawImage(video,0,0,width,height);
        const model = await blazeface.load();
        const returnTensors = false;
        const predictions = await model.estimateFaces(video, returnTensors);
        var m = Date.now();
        console.log('loading model:' ,m-n)

          if (predictions.length > 0)
          {
           for (let i = 0; i < predictions.length; i++) {
           const start = predictions[i].topLeft;
           const end = predictions[i].bottomRight;
           var probability = predictions[i].probability;
           const size = [end[0] - start[0], end[1] - start[1]];
           const bbox_0 = start[0];
           const bbox_1 = start[1];
           const bbox_2 = end[0];
           const bbox_3 = end[1];

           var bbox_width = end[0] - start[0];
           var bbox_height  = end[1] - start[1];
           const bbox_delta = (bbox_height - bbox_width) / 2;
            if (bbox_height > bbox_width){
                // console.log(1)
                if ((bbox_0 - bbox_delta) < 0){
                // crop = face[bbox[1]:bbox[3], 0:bbox[2] + bbox[0], :]};
                    var x = 0;
                    var y = bbox_1;
                    bbox_width = bbox_2 - bbox_0 - x;
                    bbox_height = bbox_3 - y;
            }
                else if ((bbox_2 + bbox_delta) >= width){
                // crop = face[bbox[1]:bbox[3], bbox[0] - (face.shape[1] - bbox[2]):(face.shape[1] - 1), :]}
                // console.log(2)
                    var x =  bbox_0 + (height - bbox_2);
                    var y = bbox_1;
                    bbox_width = height-1 - x ;
                    bbox_height = bbox_3 - y;
            }
                else{
                    // console.log(3)
                // crop = face[bbox[1]:bbox[3], bbox[0] - bbox_delta:bbox[2] + bbox_delta, :]}}
                    var x = bbox_0  +  bbox_delta;
                    var y = bbox_1 - 1;
                    bbox_width = bbox_2 -  bbox_delta -  x; 
                    bbox_height = bbox_3 - y;
            }}else if(bbox_height < bbox_width){
                if ((bbox_1-bbox_delta) < 0){
                    // console.log(4)
                    // crop = face[0:bbox[3]+bbox[1], bbox[0]:bbox[2], :]}
                    var x = bbox_0; 
                    var y = 0;
                    bbox_width = bbox_2 - x; 
                    bbox_height = bbox_3+bbox_1 - y;
                }else if (((bbox_3+bbox_delta) >= width)){
                    // console.log(5)
                // crop = face[bbox[1]-(bbox[3]-face.shape[0]):(face.shape[0]-1), bbox[0]:bbox[2], :]}
                    var x = bbox_0;
                    var y = bbox_1-(bbox_3-width);
                    bbox_width = bbox_2 - x; 
                    bbox_height = (width-1) - y;
                }else{
                // crop = face[bbox[1]-bbox_delta:bbox[3]+bbox_delta, bbox[0]:bbox[2], :]}
                // console.log(6)
                    var x = bbox_0;
                    var y = bbox_1+bbox_delta;
                    bbox_width = bbox_2 - x;
                    bbox_height = bbox_3-bbox_delta - y;
            }}else{
            // crop = face[bbox[1]:bbox[3], bbox[0]:bbox[2], :]}}
            // console.log(7)
                var x = bbox_0; 
                var y = bbox_1;
                bbox_width = bbox_2 - x; 
                bbox_height = bbox_3 - y;
            }
            // console.log((bbox_width*bbox_height)/(width*height))
           // Render a rectangle over each detected face.
        //    console.log((bbox_width*bbox_height)/(width*height))
           if ((bbox_width*bbox_height)/(width*height)>=0.2 & (bbox_width*bbox_height)/(height*width)<= 0.65){
           
           const landmarks  = predictions[i].landmarks
           if (landmarks[0][0]<landmarks[2][0] & landmarks[1][0]>landmarks[2][0]){
           
           context.beginPath();
           context.strokeStyle="green";
           context.lineWidth = "4";
        //    context.rect(start[0], start[1],size[0], size[1]);
           context.rect(x,y,bbox_width,bbox_height)
           context.stroke();

            for(let lands = 0; lands < landmarks.length; lands++){
                    context.beginPath();
                    context.strokeStyle="red";
                    context.arc(landmarks[lands][0],landmarks[lands][1],2,0,2*Math.PI)
                    context.stroke();
            }
           
           var prob = (probability[0]*100).toPrecision(5).toString();
           var text = prob+"%";
           context.fillStyle = "red";
           context.font = "13pt sans-serif";
           context.fillText(text,x+5,y+20);
           }
        else {
            alert('Look Straight')
        }}
            else if ((bbox_width*bbox_height)/(width*height)<0.2) {
                alert('Come Close')
            }
            else {
                alert('Go behind')
            }


            } 
            var l = Date.now();
            console.log('after loading time ', l-n)
            console.log('gap ', l-m)
           }
        setTimeout(draw,1000/30,video,context,width,height);
    }
})();
