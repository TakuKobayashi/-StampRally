import express, { NextFunction, Request, Response } from 'express';

import { messagingApi, middleware } from '@line/bot-sdk';
const { MessagingApiClient } = messagingApi;

const lineBotRouter = express.Router();

const config = {
  channelAccessToken: process.env.LINE_BOT_CHANNEL_ACCESSTOKEN,
  channelSecret: process.env.LINE_BOT_CHANNEL_SECRET,
};

const client = new MessagingApiClient(config);

lineBotRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json('hello line');
});

lineBotRouter.post('/message', middleware(config), async (req: Request, res: Response, next: NextFunction) => {
  console.log(JSON.stringify(req.body));
  const result = await Promise.all(req.body.events.map(async (event) => handleEvent(event))).catch((err) => {
    console.error(err);
    res.status(200).end();
    Promise.reject(err);
  });
  res.json(result);
});

async function handleEvent(event) {
  if (event.type === 'join') {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: 'hello join',
        },
      ],
    });
  } else if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: 'text',
        text: event.message.text,
      },
    ],
  });
}

export { lineBotRouter };
