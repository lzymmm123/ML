train_examples = [];
test_examples = [];
split_per = 0.2;
tree = null;
feature1Set = new Set();
feature2Set = new Set();
feature3Set = new Set();
feature4Set = new Set();
featureMap = new Map([
    ['feature1',feature1Set],
    ['feature2',feature2Set],
    ['feature3',feature3Set],
    ['feature4',feature4Set]
])
class Node {
    constructor(examples) {
        this.examples = examples;
        this.left = null;
        this.right = null;
        this.children = [];
        this.sign = null;
        this.signValue = null;
    }
}
class Tree {
    constructor(tree) {
        this.tree = tree;
    }
    predict(features){
        let node = this.tree;
        while(node instanceof Node){
            let sign = node.sign[0];
            let i = 0;
            let flag = false;
            for(let t of node.children){
                let value = features.get(sign);
                console.log("featureV",value);
                console.log("children ",i,t.signValue);
                if(t.signValue==value){
                    node = t;
                    console.log(i);
                    console.log(node);
                    flag = true;
                    break;
                }
                i++;
            }
            if(!flag){
                console.log("无法查询");
                break;
            }
        }
        return node;
    }
}
class Leaf {
    constructor(label,value) {
        this.label = label;
        this.signValue = value;
    }
}
function chooseSplitDim(examples) {
    let featureDim = '';
    let maxGDA = -1;
    let keys = examples[0].keys();
    let t = keys.next().value;
    let HD = calHD(examples,'label',[0,1,2,3]);
    while(t!='label'&&t!=undefined){
        let HDA = calHDA(examples,t,featureMap.get(t),[0,1,2,3]);
        let GDA = (HD-HDA)/HD;
        if(GDA>maxGDA){
            maxGDA = GDA;
            featureDim = t;
        }
        t = keys.next().value;
    }
    return [featureDim,maxGDA];
}
function splitExamples(examples,axis,value) {
    let resExamples = [];
    for(let example of examples){
        if(example.get(axis)==value){
            let newExample = new Map(example);
            newExample.delete(axis);
            resExamples.push(newExample);
        }
    }
    return resExamples;
}
function selectMost(examples) {
    let nums = [0,0,0]
    for(let example of examples){
        let label = example.get('label');
        nums[label] += 1;
    }
    return [nums,nums.indexOf(Math.max.apply(Math,nums))];
}
function buildDecisionTree(examples,value) {
    let most = selectMost(examples);
    let bestAxis = chooseSplitDim(examples)[0];
    if(examples[0].size===1||bestAxis===''){
        return new Leaf(most[1],value);
    }
    if(most[0][most[1]]==examples.length){
        return new Leaf(most[1],value);
    }
    let root = new Node(examples);
    root.sign = [bestAxis,examples[0].get(bestAxis)];
    let featureSet = new Set();
    for (let example of examples){
        featureSet.add(example.get(bestAxis));
    }
    for(let value of featureSet){
        let childExamples = splitExamples(examples,bestAxis,value);
        let child = buildDecisionTree(childExamples,value);
        root.children.push(child);
    }
    return root;
}
function calEqualNum(examples,name,value) {
    let num = 0;
    for(let example of examples){
        if(example['label']===value){
            num+=1;
        }
    }
    return num;
}
function calHD(train_examples,name,valueSet) {
    let HD = 0;
    let D = train_examples.length;
    let calObj = new Map();
    valueSet.forEach(element => {
        calObj[element] = 0;
    });
    for(let example of train_examples){
        calObj[example.get(name)] += 1;
    };
    for(let key in calObj){
        let val = calObj[key];
        if(val==0) HD+=0;
        else HD += -(val/D)*(Math.log2(val/D));
    }
    return HD;
}
function calHDA(train_examples,name,valueSet,labelSet){
    let HD = 0;
    let D = train_examples.length;
    let calObj = new Map();
    valueSet.forEach(element => {
        calObj[element] = {
            num:0,
            labelNum:new Map(),
        };
        labelSet.forEach(label=>{
            calObj[element].labelNum[label] = 0;
        });
    });
    for(let example of train_examples){
        calObj[example.get(name)].num += 1;
        calObj[example.get(name)].labelNum[example.get('label')] += 1;
    };
    for(let key in calObj){
        let num = calObj[key].num;
        let labelNum = calObj[key].labelNum;
        let tem = 0;
        for(let l in labelNum){
            if(labelNum[l]==0) tem += 0;
            else tem += -(labelNum[l]/num)*Math.log2(labelNum[l]/num);
        }
        HD += (num/D)*tem;
    };
    return HD;
};

fetch("./iris.data")
.then(res=>{
    return res.text();
}).then(text => {
    rows = text.split('\n');
    for(let row of rows){
        features = row.split(',');
        label = 0;
        switch (features[4]) {
            case 'Iris-setosa':
                label = 0;
                break;
            case 'Iris-versicolor':
                label = 1;
                break;
            case 'Iris-virginica':
                label = 2;
                break;
            default:
                break;
        }
        example = new Map(
            [['feature1',features[0]],
            ['feature2',features[1]],
            ['feature3',features[2]],
            ['feature4',features[3]],
            ['label',label]]
        );
        if(Math.random()>0.2){
            feature1Set.add(features[0]);
            feature2Set.add(features[1]);
            feature3Set.add(features[2]);
            feature4Set.add(features[3]);
            train_examples.push(example);
        }
        else test_examples.push(example);
    }
    tree = new Tree(buildDecisionTree(train_examples));
    
});