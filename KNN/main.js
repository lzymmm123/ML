var model;
var data = [];
var flag = true;
var res = [];
var nearPoints = [];
var tm;
var tNear = [];
var saveNears = [];
function setup(){
    createCanvas(400,400);
    textSize(30);
    
    //model = new KDTree(2);
}

function draw(){
    background(51);
    text(mouseX,10,30);
    text(mouseY,10,60);
    if(flag){
        model = new KDTree(2,data);
    }
    if(res.length!=0){
        let t = model.search(res,10);
        t.forEach((node,index) => {
            //console.log(node.data);
            nearPoints = nearPoints.concat(node.data);
        });
        saveNears = nearPoints;
        
    }
    if(keyIsPressed&&key == "n"){
        
        for(let i = 1 ; i<= tm.data.length-1;i++){
            stroke(255,255,0);
            strokeWeight(5);
            ellipse(tm.data[i][0],tm.data[i][1],16,16);
        }
    }
    gPoint();
    gTest();
}
function keyReleased(){
    if(key == " "){
        flag = false;
    }
    if(key == "m"){
        tm = new MaxHeap(10);
        tm.less = function(x,y) {
            if(x == Infinity){
                return false;
            }else if(y == Infinity){
                return true;
            }
            return this.calDist(x,res) < this.calDist(y,res);
        }
        data.forEach((val,index) => {
            tm.insert(val);
        });
    }
    if(key == "x"){
        //console.log(saveNears);
    }
}
function mousePressed(){
    if(keyIsPressed){
        if (key == " "&&mouseButton == LEFT){
            // let x = map(mouseX,0,width,0,1);
            // let y = map(mouseY,0,height,1,0);
            data.push([mouseX,mouseY]);
            // if(flag){
            //     model = new KDTree(2,data);
            // }
            //console.log(data);
        }
        if ((key == "S"||key == "s")&&mouseButton == LEFT){
            res[0] = mouseX;
            res[1] = mouseY;
        }
    }
}
function gTest(){
    stroke(0,255,0);
    strokeWeight(5);
    point(res[0],res[1]);
    stroke(0,0,255);
    strokeWeight(3);
    //console.log(nearPoints);
    for(let i = 1;i<= nearPoints.length-1;i++){
        line(nearPoints[i][0],nearPoints[i][1],res[0],res[1]);
    }
    nearPoints = [];

}
function gPoint(){
    data.forEach((val,index) => {
        stroke(255,0,0);
        strokeWeight(5);
        point(val[0],val[1]);
    });
}