const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// 要推送的完整文本
const fullText = `《大明王朝1566》经典语录
1. 不要你有多大的本事，懂规矩就是最大的本事。
2. 不谋全局者，不可谋一隅，不谋一世者，并不可谋一时。
3. 这大明朝能呼风唤雨的只有一个人，就是皇帝。能遮风挡雨的也只有一个人，就是我-严嵩。
4. 历来造反的都是种田的人，没听说商人能闹翻了天。
5. 任何一句话，你不说出来便是那句话的主人，你说了出来，便是那句话的奴隶
6. 任何人答应你的事都不算数，只有自己能做主的才算数。`;

// 按8-10字切分文本
function splitText(text, min = 8, max = 10) {
  const result = [];
  let i = 0;
  while (i < text.length) {
    // 随机每段8-10字
    const len = Math.min(
      max,
      Math.max(min, Math.floor(Math.random() * (max - min + 1)) + min)
    );
    result.push(text.slice(i, i + len));
    i += len;
  }
  return result;
}

const textChunks = splitText(fullText);

app.get('/sse', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  // 设置客户端重连时间为3秒
  res.write('retry: 3000\n');

  // 发送两条注释
  res.write(': 连接已建立\n\n');
  res.write(': 开始返回数据\n\n');

  // 模拟消息返回
  let idx = 0;
  const interval = setInterval(() => {
    if (idx < textChunks.length) {
      res.write(`id: ${idx}\n`); // 消息体ID
      res.write('event: chunk\n'); // 事件类型
      res.write(`data: ${textChunks[idx]}\n\n`); // 消息体 我这里直接字符串返回了，你也可以根据自己业务放json返回
      idx++;
    } else {
      res.write('event: end\nid: end\ndata: END\n\n');
      clearInterval(interval);
      res.end();
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

app.listen(PORT, () => {
  console.log(`SSE server running at http://localhost:${PORT}/sse`);
}); 