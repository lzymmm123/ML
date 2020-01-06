var canvas;
var h;
var w;
var img;

var data_tensor;
var gray_counts;
// var gray_probability;
// var E_gray;
// var test_data;
window.onload = function(){
    canvas = document.getElementById("canvas");
    h = canvas.height;
    w = canvas.width;
    img = document.getElementById("img");
    data_tensor = tf.browser.fromPixels(img,1);
    gray_counts = new Array(256).fill(0);
    // gray_probability = new Array(256).fill(0);
    // E_gray = new Array(256).fill(0);
    cal_gray_each_probability();
    let n = getCLassCount();
    console.log(n);
    // tf.browser.toPixels(data_tensor,canvas);
    EMIter(10,n);
}

async function EMIter(nums,classes){
    let data_copy = tf.tidy(()=>{
        return data_tensor.clone().div(tf.scalar(255));
    });
    let class_probability = tf.tidy(()=>{
        let p = tf.zeros([classes,256*256]);
        // let s = p.sum(0);
        // p = p.div(s);
        return p;
    });
    let mu = tf.tidy(()=>{
        let t =  tf.zeros([classes]);
        let b = t.bufferSync();
        let m = data_copy.max().dataSync()[0];
        for(let i = 0;i<b.size;i++){
            b.set((i+1)/(classes+2)*m,i);
        }
        return t;
    });
    console.log(mu.arraySync());
    let sigma = mu.clone();
    let pc = tf.tidy(()=>{
        let t = tf.randomUniform([classes]);
        let s = t.sum();
        t = t.div(s);
        return t;
    })
    let iter = 0;
    let iter_p = class_probability.bufferSync();
    let iter_mu = mu.bufferSync();
    let iter_sigma = sigma.bufferSync();
    let iter_pc = pc.bufferSync();
    while(iter<nums){
        console.log("iter  "+iter);
        //---------E--------
        for(let i = 0;i<classes;i++){
            let res = tf.tidy(()=>{
                let ri = data_copy.sub(tf.scalar(iter_mu.get(i))).pow(2).div(tf.scalar(-2*(iter_sigma.get(i)**2)));
                let re = tf.exp(ri);
                let ro = tf.scalar(1/((2**0.5)*iter_sigma.get(i)));
                let r = re.mul(ro);
                r = r.where(r.greaterEqual(0.000001),tf.onesLike(r).mul(tf.scalar(0.000001)));
                return r;
            });
            class_probability = tf.tidy(()=>{
                let up = class_probability.slice([0],[i]);
                let t = res.reshape([1,256*256]).mul(tf.scalar(iter_pc.get(i)));
                let down = class_probability.slice([i+1],[classes-i-1])
                t = tf.concat([up,t,down],0);
                // let r = class_probability.mul(t);
                class_probability.dispose();
                return t;
            });
            // for(let j = 0;i<256*256;j++){
            //     iter_p.set(iter_pc.get(i)*array[j],i,j);
            //     console.log("set ",j);
            // }
            res.dispose();
        }
        console.log("iter  "+iter+"  "+"归一");
        //--------归一------
        let norm = tf.tidy(()=>{
            let t = class_probability.sum(0).reshape([1,256*256]).tile([classes,1]);
            return t;
        });
        class_probability = tf.tidy(()=>{
            let r = class_probability.div(norm);
            class_probability.dispose();
            return r;
        });
        norm.dispose();
        
        iter_p = class_probability.bufferSync();

        //-------M-----------
        console.log("iter  "+iter+"  "+"M");
        pc = tf.tidy(()=>{
            let r = class_probability.sum(1).div(tf.scalar(256*256));
            r.sum().print();
            pc.dispose();
            return r;
        });
        mu = tf.tidy(()=>{
            let d = data_copy.reshape([1,256*256]).tile([classes,1]);
            let u = class_probability.mul(d).sum(1);
            let r = class_probability.sum(1);
            r = u.div(r);
            mu.dispose();
            return r;
        });
        sigma = tf.tidy(()=>{
            let d = data_copy.reshape([1,256*256]).tile([classes,1]);
            d = d.sub(mu.reshape([classes,1])).pow(2);
            let u = class_probability.mul(d).sum(1);
            let r = class_probability.sum(1);
            r = u.div(r);
            sigma.dispose();
            return r;
        });
        iter_mu = mu.bufferSync();
        iter_sigma = sigma.bufferSync();
        iter_pc = pc.bufferSync();

        iter++;
        console.log(class_probability.dataSync());
        let pixels = tf.tidy(()=>{
            let r = class_probability.argMax(0).asType("float32");
            r = r.div(r.max()).reshape([256,256,1]);
            r = tf.image.resizeNearestNeighbor(r,[h,w]);
            return r;
        });
        // console.log(pixels.dataSync());
        await tf.browser.toPixels(pixels,canvas).then(()=>{
            pixels.dispose();
        });
    }
    data_copy.dispose();
    mu.dispose();
    class_probability.dispose();
    sigma.dispose();
}
function render(){
    split_image();
}
function cal_gray_each_probability(){
    let t = data_tensor.dataSync();
    for(let i = 0;i<t.length;i++){
        gray_counts[t[i]] += 1;
    }
    // E_gray[0] = 0*gray_counts[0]/t.length;
    // gray_probability[0] = gray_counts[0]/t.length;
    // for(let i = 1;i<256;i++){
    //     gray_probability[i] =gray_probability[i-1] + gray_counts[i]/t.length;
    //     E_gray[i] = E_gray[i-1]+i*gray_counts[i]/t.length;
    // }
}
function getCLassCount(){
    let res = tf.tidy(()=>{
        let c = tf.tensor(gray_counts,[gray_counts.length,1]);
        let f = tf.tensor([1/3,1/3,1/3],[3,1,1]);
        let r = tf.conv1d(c,f,1,"same");
        for(let i = 0;i<5;i++){
            r = tf.conv1d(r,f,1,"same");
        }
        return r;
    });
    let t = res.dataSync();
    let count = 0;
    let t0 = new Array(256).fill(0);
    t0[0] = t[0];
    for(let i = 1;i<256;i++){
        t0[i] = t[i]-t[i-1];
    }
    for(let i = 1;i<256;i++){
        if(t0[i-1]>0&&t0[i]<=0){
            count++;
        }
    }
    res.dispose();
    return count;
}
function split_image(){
    let newdata = tf.tidy(()=>{
        let s = data_tensor.clone().div(tf.scalar(255));
        let fx = [1,0,-1,1.14,0,-1.14,1,0,-1];
        let fy = [1,1.14,1,0,0,0,-1,-1.14,-1];
        let xconv = tf.tensor(fx,[3,3,1,1]);
        let yconv = tf.tensor(fy,[3,3,1,1]);
        let ix = tf.conv2d(s,xconv,1,"same");
        let iy = tf.conv2d(s,yconv,1,"same");
        let r = ix.pow(2).add(iy.pow(2)).pow(0.5);
        r = r.div(r.max());
        r = tf.image.resizeNearestNeighbor(r,[h,w]);
        return r;
    })
    tf.browser.toPixels(newdata,canvas).then(()=>{
        newdata.dispose();
    });
}