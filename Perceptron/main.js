var model;
var data = [];
function setup(){
    createCanvas(400,400);
    model = new Perceptron(2,1);
}

function draw(){
    background(51);
    data.forEach((val) => {
        model.update([val[0],val[1]],val[2]);
        //console.log(model.weights);
    })
    //console.log("k:"+(-model.weights[0])/model.weights[1])
    //console.log("b:"+(-model.bias)/model.weights[1])
    gPoint();
    gLine();


}
function gPoint(){
    data.forEach((val,index) => {
        //onsole.log(val[2]);
        if(val[2]==1){
            stroke(255,0,0);
            
        }else if(val[2]==-1){
            stroke(0,255,0);
        }
        strokeWeight(5);
        let x = map(val[0],0,1,0,width);
        let y = map(val[1],0,1,height,0);
        point(x,y);
    });
}
function gLine(){
    stroke(0,0,255);
    strokeWeight(4);
    let x1 = 0;
    let y1 = -(model.bias+model.weights[0]*x1)/(model.weights[1]+0.00001);
    let x2 = 1;
    let y2 = -(model.bias+model.weights[0]*x2)/(model.weights[1]+0.00001);
    let mx1 = map(x1,0,1,0,width);
    let mx2 = map(x2,0,1,0,width);
    let my1 = map(y1,0,1,height,0);
    let my2 = map(y2,0,1,height,0);
    // let x1 = 0;
    // let y1 = -(-100+1*x1)/(1+0.00001);
    // let x2 = width;
    // let y2 = -(-100+1*x2)/(1+0.00001);
    line(mx1,my1,mx2,my2);
    // line(0,height+50,width,-30);
}
function mousePressed(){
    if (mouseButton == LEFT){
        let x = map(mouseX,0,width,0,1);
        let y = map(mouseY,0,height,1,0);
        data.push([x,y,1])
        //console.log(data);
    }
    if (mouseButton == CENTER){
        let x = map(mouseX,0,width,0,1);
        let y = map(mouseY,0,height,1,0);
        data.push([x,y,-1])
        //console.log(data);
    }
}
function preload(){

}