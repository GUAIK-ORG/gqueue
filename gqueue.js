// Queue
var GQueue = /** @class */ (function () {
    // 构造消费者队列
    // consumeFn: 消费者回调函数
    // consumeDelay: 控制消费者消费的速度（毫秒）
    // maxLen: 接收队列最大值，超出的消息将被丢弃
    function GQueue(consumeFn, consumeDelay, maxLen) {
        this.queue = new Array();
        this.maxLen = maxLen;
        this.dataMap = {};
        this.dataKeyQueue = new Array();
        this.checkUnique = false;
        this.consumeNoticeFn = consumeFn;
        this.consumeDelay = consumeDelay;
        this.consumeState = 0;
        this.consumeFlag = 0;
        this.owner = null;
    }
    // 延时函数
    GQueue.prototype.sleep = function (ms) {
        // @ts-ignore
        return new Promise(function (resolve, reject) {
            setTimeout(function () { return resolve(ms); }, ms);
        });
    };
    // 生产者：用于将消息提交到生产者队列
    GQueue.prototype.product = function (id, data) {
        if (this.queue.length < this.maxLen || this.maxLen == -1) {
            // 检查消息唯一性
            if (this.checkUnique && this.dataMap.hasOwnProperty(id)) {
                return;
            }
            // 插入消息
            this.queue.push({ 'id': id, 'data': data });
            this.dataKeyQueue.push(id);
            this.dataMap[id] = data;
            // 通知消费者
            if (this.consumeState == 0) {
                this.consume();
            }
            else {
                this.consumeFlag = 1;
            }
        }
    };
    // 消费者：将队列中的消息按照给定的速度进行消费
    GQueue.prototype.consume = function () {
        var _this = this;
        this.consumeState++;
        this.sleep(this.consumeDelay).then(function (r) {
            var data = _this.queue.shift();
            if (data) {
                _this.consumeNoticeFn(_this.owner, data['data']);
                // 检查并清理dataMap
                while (_this.maxLen > 0 && _this.dataKeyQueue.length >= _this.maxLen * 2) {
                    delete _this.dataMap[_this.dataKeyQueue.shift()];
                }
            }
            if (_this.queue.length > 0 || _this.consumeFlag) {
                _this.consumeFlag = 0;
                _this.consume();
            }
            _this.consumeState--;
        });
    };
    GQueue.prototype.setUnique = function (b) {
        this.checkUnique = b;
    };
    // 判断队列是否可写入
    GQueue.prototype.canRecvWrite = function () {
        return (this.queue.length < this.maxLen || this.maxLen == -1);
    };
    // 设置拥有者
    GQueue.prototype.setOwner = function (owner) {
        this.owner = owner;
    };
    return GQueue;
}());
////////// DEMO //////////
var gqueue = new GQueue(function (owner, data) {
    console.log(owner, data);
}, 10, 10);
// 模拟产生消息
for (var i = 0; i < 50; i++) {
    if (gqueue.canRecvWrite()) {
        gqueue.product(0, "product:" + i);
    }
}
