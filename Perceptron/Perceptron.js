class Perceptron{
    constructor(dim,rate){
        this.dimension = dim;
        this.rate = rate;
        this.weights = [];
        for(let i = 0 ; i< this.dimension; i++){
            this.weights[i] = 0;
        }
        this.bias = 0;
        this.data = [];
    }

    predict(data){
        let sum = 0;
        for(let i = 0;i<this.dimension;i++){
            sum += this.weights[i]*data[i];
        }
        sum+=this.bias;
        return sum;
    }
    update(data,label){
        let predict_label = this.predict(data);
        let gap = -predict_label*label;
        if(gap>=0){
            this.weights.forEach((val,index) => {
                this.weights[index] += this.rate*data[index]*label;
            });
            this.bias += this.rate*label;
        }
    }
};