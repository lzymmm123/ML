class Node{
    constructor(vals,splitdim) {
        this.data = vals;
        this.splitDim = splitdim;
        this.left = null;
        this.right = null;
        this.visited = true;
    }
}
class MaxHeap{
    constructor(k){
        this.k = k;
        this.data = new Array(k+1).fill(Infinity);
    }
    insert(x){
        if(x==null){

        }
        else if(this.less(x,this.data[1])){
            //console.log(this.data);
            this.data[1] = x;
            //this.swap(0,1);
            this.shiftDown(1);
        }
    }
    calDist(x,y){
        let sum = 0;
        x.forEach((val,index) => {
            sum += (val-y[index])**2;
        });
        return sum**0.5;
    }
    shiftDown(i){
        while(2*i<=this.k){
            let j = 2*i;
            if(j+1<=this.k&&this.less(this.data[j],this.data[j+1])){
                j +=1;
            }
            if(this.less(this.data[j],this.data[i])){
                break;
            }
            this.swap(i,j);
            i = j;
        }
    }
    swap(i,j){
        let t = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = t;
    }
    less(x,y){
        return x-y<0;
    }
}
class KDTree{
    constructor(dim,datas){
        this.dimension = dim;
        this.root = null;
        this.deepth = 0;
        if(datas.length!=0){
            this.root = this.establishKDTree(datas,0);
        }
    }

    establishKDTree(datas,deepth=0){
        if(datas.length==0){
            return null;
        }
        let targetDim = deepth%this.dimension;
        let splitPoints = [];
        let leftDatas = [];
        let rightDatas = [];
        let sortedAll = datas.sort(function(a,b){
            return a[targetDim]-b[targetDim];
        });
        let median = sortedAll[floor(datas.length/2)][targetDim];
        datas.forEach((val,index) => {
            //console.log(val);
            if(val[targetDim]<median){
                leftDatas.push(val);
            }else if(val[targetDim]>median){
                rightDatas.push(val);
            }else{
                splitPoints.push(val);
            }
        });
        let r = new Node(splitPoints,targetDim);
        r.left = this.establishKDTree(leftDatas,deepth+1);
        r.right = this.establishKDTree(rightDatas,deepth+1);
        return r;
    }
    calDist(x,y){
        let sum = 0;
        x.forEach((val,index) => {
            sum += (val-y[index])**2;
        });
        return sum**0.5;
    }
    search(data,k){
        let path = [];
        let curNode = this.root;
        this.heap = new MaxHeap(k);
        this.heap.less = function(x,y){
            if(x == Infinity){
                return false;
            }else if(y == Infinity){
                return true;
            }
            let sumx = [];
            let sumy = [];
            x.data.forEach((val,index) => {
                sumx.push(this.calDist(val,data));
            });
            y.data.forEach((val,index) => {
                sumy.push(this.calDist(val,data));
            });
            return min(sumx)-min(sumy)<=0
        }
        while (curNode!=null) {
            let sd = curNode.splitDim;
            path.push(curNode);
            //this.heap.insert(curNode);
            if(data[sd]<=curNode.data[0][sd]){
                curNode = curNode.left;
            }else{
                curNode = curNode.right;
            }
        }
        //pathDir.push(0);
        //console.log("123");
        // curNode = path.pop();
        // curNode.visited = true;
        while (path.length!=0) {
            //let back_point = path.pop();
            curNode = path.pop();
            this.heap.insert(curNode);
            curNode.visited = true;
            
            let radius;
            if(this.heap.data[1]==Infinity){
                radius = Infinity;
            }else{
                radius = this.calDist(data,this.heap.data[1].data[0])
            }
            //console.log(abs(curNode.data[0][curNode.splitDim]-data[curNode.splitDim])<radius);
            if(abs(curNode.data[0][curNode.splitDim]-data[curNode.splitDim])<radius){
                if(data[curNode.splitDim]<=curNode.data[0][curNode.splitDim]){
                    curNode = curNode.right;
                }else{
                    curNode = curNode.left;
                }
                // if(curNode!=null){
                //     path.push(curNode);
                // }
                
                // if(curNode.left == null){
                //     curNode = null;
                // }else if(curNode.left.visited == false){
                //     curNode = curNode.left;
                //     //console.log("enter left");
                // }else if(curNode.right == null){
                //     curNode = null;
                // }else if(curNode.right.visited == false){
                //     curNode = curNode.right;
                //     //console.log("enter right");
                // }
                //curNode = dir==0?curNode.right:curNode.left;
                while (curNode!=null) {
                    let sd = curNode.splitDim;
                    path.push(curNode);
                    if(data[sd]<=curNode.data[0][sd]){
                        curNode = curNode.left;
                    }else{
                        curNode = curNode.right;
                    }
                }
            }
            
            //curNode = path.pop();
        }
        this.setVisited(this.root);
        return this.heap.data;
    }
    setVisited(root){
        if(root==null){
            return;
        }
        root.visited = false;
        this.setVisited(root.left);
        this.setVisited(root.right);
    }
}