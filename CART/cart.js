const  fs = require('fs');

class Example {
    constructor(features,label) {
        if (features instanceof Array){
            this.features = features;
            this.features_num = this.features.length;
        }else{
            this.features = [features];
            this.features_num = 1;
        }
        this.label = label;
    }
    copy(){
        return new Example(this.features,this.label);
    }
}
class Node {
    constructor(split_val,split_dim,label) {
        this.split_val = split_val;
        this.split_dim = split_dim;
        this.label = label;
        this.data = null;
        this.left = null;
        this.right = null;
    }
    copy(){
        let node = new Node(this.split_val,this.split_dim,this.label);
        node.data = this.data;
        node.left = null;
        node.right = null;
        if(this.left!=null){
            node.left = this.left.copy();
        }
        if(this.right!=null){
            node.right = this.right.copy();
        }
        return node;
    }
}
class CARTTree {
    constructor() {
        this.tree = new Node();
    }
    copy(){
        let tree = new CARTTree();
        if(this.tree!=null){
            tree.tree = this.tree.copy(); 
        }
        return tree;
    }
    buildTree(node,dataSet,threshold_nums,threshold_gini){
        let giniD = Gini(dataSet);
        node.data = dataSet;
        // console.log(dataSet.length);
        // console.log("gggg",giniD);
        let most_label = get_most_label(dataSet);
        if(giniD<=threshold_gini){
            node.split_val = -1;
            node.split_dim = -1;
            node.label = most_label;
            return;
        }
        else if(dataSet.length<=threshold_nums){
            node.split_val = -1;
            node.split_dim = -1;
            node.label = most_label;
            return;
        }
        let min_split = get_min_split(dataSet);
        console.log(min_split);
        let split_val = min_split[1],split_dim = min_split[2];
        let D1 =[],D2 = [];
        for(let d of dataSet){
            if(d.features[split_dim]<=split_val){
                D1.push(d);
            }else{
                D2.push(d);
            }
        }
        node.split_val = split_val;
        node.split_dim = split_dim;
        node.label = most_label;
        node.left = new Node();
        node.right = new Node();
        this.buildTree(node.left,D1,threshold_nums,threshold_gini);
        this.buildTree(node.right,D2,threshold_nums,threshold_gini);
    }
    predict(test_examples){
        let test_dataset = []
        let predicts = [];
        if(!test_examples instanceof Array){
            test_dataset.push(test_examples)
        }else{
            test_dataset = test_examples;
        }
        let n = test_dataset.length;
        for(let example of test_dataset){
            let node = this.tree;
            while(node.left!=null&&node.right!=null){
                if(example.features[node.split_dim]<=node.split_val){
                    node = node.left;
                }else{
                    node = node.right;
                }
            }
            predicts.push(node.label);
        }
        return predicts;
    }
    pruning(test_dataset){
        let k = 0;
        let T = [];
        T[k] = this.copy();
        while(!is_only_three_nodes(T[k].tree)&&!is_leaf(T[k].tree)){
            let inner_nodes = [];
            let t = T[k].tree;
            if(t.left!=null||t.right!=null){
                inner_nodes.push(t);
            }
            if(inner_nodes.length==0){
                return this;
            }
            let p = 0;
            while(p<inner_nodes.length&&!is_leaf(inner_nodes[p])){
                //console.log(inner_nodes[p])
                if(inner_nodes[p].left!=null&&inner_nodes[p].right!=null){
                    if(!is_leaf(inner_nodes[p].left)){
                        inner_nodes.push(inner_nodes[p].left);
                        // console.log("push--------------left");
                        // console.log(inner_nodes[p].left)
                    }
                    if(!is_leaf(inner_nodes[p].right)){
                        inner_nodes.push(inner_nodes[p].right);
                        // console.log("push--------------right");
                        // console.log(inner_nodes[p].right);
                    }
                }
                p++;
            }
            inner_nodes = inner_nodes.reverse();
            let alphas = [];
            let min_alpha = {alpha:0x7fffffff,index:-1};
            for(let i = 0;i<inner_nodes.length;i++){
                let a = get_node_alpha(inner_nodes[i]);
                if(a<min_alpha.alpha){
                    min_alpha.alpha = a;
                    min_alpha.index = i;
                }
                alphas.push(a);
            }
            let temp = T[k].copy();
            // console.log(inner_nodes[min_alpha.index]);
            // console.log(inner_nodes[min_alpha.index].right);
            inner_nodes[min_alpha.index].left = null;
            inner_nodes[min_alpha.index].right = null;
            T[k+1] = T[k];
            T[k] = temp;
            k++;
            // console.log(inner_nodes.length);
            // console.log(min_alpha.index);
            // console.log(min_alpha.alpha);
            // console.log(alphas);
            // console.log("rrrrrrrrrrrrrrrrrrrrr");
        }
        // console.log("rrrrrrrrrrrrrrrrrrrrr");
        // console.log(T);
        return T;
    }
}
function is_leaf(node){
    if(node.left==null&&node.right==null){
        return true;
    }
    return false;
}
function get_tree_nodes(node,inner_nodes){
    if(node.right!=null||node.left!=null){
        inner_nodes.nodes.push(node);
        return;
    }
    if(node.left!=null){
        let left = node.left;
        get_node_leafs(left,inner_nodes);
    }
    if(node.right!=null){
        let right = node.right;
        get_node_leafs(right,inner_nodes);
    }
}
function is_only_three_nodes(node){
    if(node.left!=null&&node.right!=null){
        let l = node.left;
        let r = node.right;
        if(l.left==null&&l.right==null&&r.left==null&&r.right==null){
            return true;
        }
    }
    return false;
}
function get_sub_tree_loss(node,alpha){
    let dataset = node.data;
    let loss = Gini(dataset);
    let leafs = {num:0};
    get_node_leafs(node,leafs);
    loss += alpha*leafs.num;
    return loss;
}
function get_node_alpha(node){
    let Ct = Gini(node.data);
    let leafs_gini = {gini:0,num:0};
    get_node_leafs_gini(node,leafs_gini);
    let CTt = leafs_gini.gini/leafs_gini.num;
    let alpha = (Ct-CTt)/((leafs_gini.num-1)+1e-6);
    return alpha;
}
function get_node_leafs_gini(node,leafs_gini){
    if(node.right==null&&node.left==null){
        leafs_gini.gini += node.data.length*Gini(node.data);
        leafs_gini.num++;
        return;
    }
    if(node.left!=null){
        let left = node.left;
        get_node_leafs(left,leafs_gini);
    }
    if(node.right!=null){
        let right = node.right;
        get_node_leafs(right,leafs_gini);
    }
}
function get_node_leafs(node,counter) {
    if(node.right==null&&node.left==null){
        counter.num++;
        return;
    }
    if(node.left!=null){
        let left = node.left;
        get_node_leafs(left,counter);
    }
    if(node.right!=null){
        let right = node.right;
        get_node_leafs(right,counter);
    }
}
function get_most_label(D){
    let label_map = new Map();
    for(let d of D){
        if(!label_map.has(d.label)){
            //console.log(label_map.has(d.label));
            label_map.set(d.label,[]);
        }
        //console.log(d);
        label_map.get(d.label).push(d);
    }
    let most_label = "";
    let most = 0;
    for(let label of label_map.keys()){
        if(label_map.get(label).length>most){
            most = label_map.get(label).length;
            most_label = label;
        }
    }
    return most_label;
}
function Gini(D){
    if(! D instanceof Array){
        console.error("DataSet should be an array");
    }
    let n = D.length;
    let label_map = new Map();
    for(let d of D){
        if(!label_map.has(d.label)){
            //console.log(label_map.has(d.label));
            label_map.set(d.label,[]);
        }
        //console.log(d);
        label_map.get(d.label).push(d);
    }
    let gini = 0;
    for(let label of label_map.keys()){
        gini += Math.pow(label_map.get(label).length/n,2);
    }
    gini = 1-gini;
    return gini;
}
function get_gini_D(D){
    if(! D instanceof Array){3
        console.error("DataSet should be an array");
    }
    let n = D.length;
    let label_map = new Map();
    for(let d of D){
        if(!label_map.has(d[1])){
            //console.log(label_map.has(d.label));
            label_map.set(d[1],[]);
        }
        //console.log(d);
        label_map.get(d[1]).push(d);
    }
    let gini = 0;
    for(let label of label_map.keys()){
        gini += Math.pow(label_map.get(label).length/n,2);
    }
    gini = 1-gini;
    return gini;
}
function get_gini_with_split(one_features_with_labels,a){
    if(! one_features_with_labels instanceof Array){
        console.error("DataSet should be an array");
    }
    let D1 =[],D2 = [];
    for(let d of one_features_with_labels){
        if(d[0]<=a){
            D1.push(d);
        }else{
            D2.push(d);
        }
    }
    let n = one_features_with_labels.length;
    let gini_DA = D1.length*get_gini_D(D1)/n+D2.length*get_gini_D(D2)/n;
    return gini_DA;
}
function get_min_split_with_A(one_features_with_labels){
    if(! one_features_with_labels instanceof Array){
        console.error("DataSet should be an array");
    }
    one_features_with_labels.sort(function(a,b){
        return a[0]-b[0];
    });
    // console.log(one_features_with_labels);
    let min_gini = get_gini_with_split(one_features_with_labels,one_features_with_labels[0][0]);
    let split_point = one_features_with_labels[0][0];
    let last = one_features_with_labels[0][0];
    for(let i = 1;i<one_features_with_labels.length;i++){
        if(Math.abs(one_features_with_labels[i][0]-last)<1e-6){
            continue;
        }else{
            let t = get_gini_with_split(one_features_with_labels,one_features_with_labels[i][0]);
            if(min_gini>t){
                min_gini = t;
                split_point = one_features_with_labels[i][0];
            }
            last = one_features_with_labels[i][0];
        }
    }
    return [min_gini,split_point];
}
function get_minGini_A(D,feature_index){
    if(! D instanceof Array){
        console.error("DataSet should be an array");
    }
    let one_features_with_labels = [];
    for(let d of D){
        let t = [d.features[feature_index],d.label];
        one_features_with_labels.push(t);
    }
    let split_gini = get_min_split_with_A(one_features_with_labels);
    return split_gini;
}
function get_min_split(D){
    let features_num = D[0].features_num;
    let min_split = [];
    for(let i = 0;i<features_num;i++){
        let s = get_minGini_A(D,i);
        min_split.push([s[0],s[1],i]);
    }
    min_split.sort(function(a,b){
        return a[0]-b[0];
    });
    return min_split[0];
}

function preData(file,features_num,split_scale){
    let data;
    data = fs.readFileSync(file).toString().split('\n');
    
    let train_examples = [];
    let test_examples = [];
    for(let example of data){
        let row = example.split(',');
        if(row.length!=features_num+1){
            continue;
        }
        let features = [];
        for(let i = 0;i<features_num;i++){
            features.push(row[i]);
        }
        let label = row[features_num];
        let t = new Example(features,label);
        if(Math.random()<split_scale){
            test_examples.push(t);
        }else{
            train_examples.push(t);
        }
    }
    return [train_examples,test_examples];
}
function main(){
    let examples =  preData('./iris.data',4,0.3);
    let train_examples = examples[0];
    let test_examples = examples[1];
    let cart_tree = new CARTTree();
    cart_tree.buildTree(cart_tree.tree,train_examples,1,0.02);
    let p = cart_tree.predict(test_examples);
    let real_labels = [];
    for(let d of test_examples){
        real_labels.push(d.label);
    }
    let n = test_examples.length;
    let r = 0;
    for(let i = 0;i<n;i++){
        if(real_labels[i]===p[i]){
            r++;
        }
    }
    console.log(n);
    console.log(r);
    console.log(r/n);

    let ts = cart_tree.pruning();
    let best_predicts = [];
    let real_labels1 = [];
    let best_tree_index = {index:-1,nums:-1};
    for(let d of test_examples){
        real_labels1.push(d.label);
    }
    for(let i = 0;i<ts.length;i++){
        let p1 = ts[i].predict(test_examples);
        let r1 = 0;
        for(let i = 0;i<test_examples.length;i++){
            if(real_labels1[i]===p1[i]){
                r1++;
            }
        }
        if(r1>best_tree_index.nums){
            best_tree_index.nums = r1;
            best_tree_index.index = i;
        }
        best_predicts[i] = r1;
    }
    let best_tree = ts[best_tree_index.index];
    console.log("best tree");
    //console.log(best_tree);
    console.log("ACCURACY",best_predicts[best_tree_index.index]/test_examples.length);
}
main();