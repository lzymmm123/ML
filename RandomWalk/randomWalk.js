function Formula(v) {
    let x = v[0];
    let y = v[1];
    let r = Math.pow((x-30),2)+Math.pow((y-50),2);
    r = Math.pow(r,0.5)+Math.E;
    let res = Math.sin(r)/r+1
    return -res;
}
function vec_add(v1,v2,stride){
    if(v1.length!=v2.length){
        console.error("Error");
    }
    let res = Array(v1.length).fill(0);
    res.forEach((_,index) => {
        res[index] = v1[index]+stride*v2[index];
    });
    return res;
}
function generate_vector(n) {
    let v = Array(n).fill(0);
    v.forEach((_,index) => {
        v[index] = 2*Math.random()-1;
    });
    let sum  =0;
    v.forEach((val) => {
        sum += val*val;
    });
    sum = Math.pow(sum,0.5);
    v.forEach((_,index) => {
        v[index] /= sum;
    });
    return v;
}
function generate_min_vector(n,nums) {
    let v_list = [];
    for(let i = 0;i<nums;i++){
        v_list.push(generate_vector(n));
    }
    let f_list = [];
    v_list.forEach((val,index) => {
        f_list[index] = Formula(val);
    });
    let index = 0;
    let min_f = f_list[0];
    for(let i = 1;i<nums;i++){
        if(f_list[i]<min_f){
            index = i;
            min = f_list;
        }
    }
    return v_list[index];
}
function main() {
    let x = [1000,-1000];
    let stride = 20;
    let N = 500;
    let epsilon = 1e-6;
    let variables_num = 2;
    let walk_num = 1;

    while(stride>epsilon){
        let k = 1;
        while (k<N){
            let u = generate_min_vector(variables_num,10);
            let x1 = vec_add(x,u,stride);
            if(Formula(x1)<Formula(x)){
                k = 1;
                x = x1;
            }
            else{
                k += 1;
            }
        }
        stride /= 2;
        console.log("第",walk_num,"次随机游走");
        console.log("此时最优点",x);
        console.log("值",Formula(x));
        walk_num += 1;
    }
}

main();