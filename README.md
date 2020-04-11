# 🚥GQueue生产消费队列

---

## GQueue简介

队列有一个特点就是用来削峰，在秒杀等业务场景下服务端也会使用消息队列先缓存大量的数据，然后再处理相关的业务，起到一个缓冲的作用。在开发前端应用时，某些场景下也会需要将数据缓冲削峰，将消息缓冲下并控制输出速度，否则界面会出现卡死的现象。

## 🚀快速开始

### 🕹克隆

```bash
git clone https://github.com/GUAIK-ORG/gqueue.git
```

### 💾 导入

```js
<script src="gqueue.js"></script>
```

## 测试代码

```js
// 初始化队列
// arg1: 设置消费者回调函数
// arg2: 控制消费者消费的速度（毫秒）
// arg3: 接收队列最大值，超出的消息将被丢弃
let gqueue = new GQueue(function (owner, data) {
    console.log(owner, data);
}, 10, 10);

// 模拟产生消息
for (let i = 0; i < 50; i++) {
    if (gqueue.canWrite()) {
        gqueue.product(0,"product:" + i);
    }
}
```
