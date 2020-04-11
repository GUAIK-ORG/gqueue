// Queue

class GQueue {
    queue:Array<any>;
    maxLen:number;
    dataMap:{[index:string]: string};
    dataKeyQueue:Array<number>;
    checkUnique:boolean;

    consumeNoticeFn:(arg1,arg2:any)=>void;
    consumeDelay:number;
    consumeState:number;
    consumeFlag:number;

    owner:any;

    // 构造消费者队列
    // consumeFn: 消费者回调函数
    // consumeDelay: 控制消费者消费的速度（毫秒）
    // maxLen: 接收队列最大值，超出的消息将被丢弃
    constructor(consumeFn:(arg1,arg2: any)=>void, consumeDelay, maxLen:number) {
        this.queue = new Array<any>();
        this.maxLen = maxLen;
        this.dataMap = {};
        this.dataKeyQueue = new Array<number>();
        this.checkUnique = false;

        this.consumeNoticeFn = consumeFn;
        this.consumeDelay = consumeDelay;
        this.consumeState = 0;
        this.consumeFlag = 0;

        this.owner = null;
    }
    // 延时函数
    sleep(ms: number): Promise<number> {
        // @ts-ignore
        return new Promise<number>((resolve, reject) => {
            setTimeout(() => resolve(ms), ms);
        });
    }
    // 生产者：用于将消息提交到生产者队列
    product(id: number,data: any): void {
        if (this.queue.length < this.maxLen || this.maxLen == -1) {
            // 检查消息唯一性
            if (this.checkUnique && this.dataMap.hasOwnProperty(id)){
               return
            }
            // 插入消息
            this.queue.push({'id':id,'data':data});
            this.dataKeyQueue.push(id);
            this.dataMap[id] = data;
            // 通知消费者
            if (this.consumeState == 0) {
                this.consume();
            }else{
                this.consumeFlag = 1;
            }
        }
    }
    // 消费者：将队列中的消息按照给定的速度进行消费
    consume():void {
        this.consumeState++;
        this.sleep(this.consumeDelay).then(r => {
            let data = this.queue.shift();
            if (data){
                this.consumeNoticeFn(this.owner, data['data']);
                // 检查并清理dataMap
                while(this.maxLen > 0 && this.dataKeyQueue.length >= this.maxLen * 2) {
                    delete this.dataMap[this.dataKeyQueue.shift()];
                }
            }
            if(this.queue.length > 0 || this.consumeFlag) {
                this.consumeFlag = 0;
                this.consume();
            }
            this.consumeState--;
        });
    }

    setUnique(b:boolean) {
        this.checkUnique = b;
    }

    // 判断队列是否可写入
    canWrite():boolean {
        return (this.queue.length < this.maxLen || this.maxLen == -1);
    }
    // 设置拥有者
    setOwner(owner:any):void {
        this.owner = owner;
    }
}

////////// DEMO //////////
let gqueue = new GQueue(function (owner, data) {
    console.log(owner, data);
}, 10, 10);

// 模拟产生消息
for (let i = 0; i < 50; i++) {
    if (gqueue.canWrite()) {
        gqueue.product(0,"product:" + i);
    }
}
