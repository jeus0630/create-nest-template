import { Timestamp } from 'typeorm';

const { IncomingWebhook } = require('@slack/client');
const webhook = new IncomingWebhook(process.env.SLACK_KEY);

exports.slackMessage = async (
  color: string,
  text: string,
  title: string,
  time: Timestamp,
): Promise<void> => {
  await webhook.send({
    attachments: [
      {
        color,
        text,
        fields: [
          {
            title,
            short: false,
          },
        ],
        ts: time,
      },
    ],
  });
};
