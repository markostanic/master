interface QueueAttributes {
  ApproximateNumberOfMessages: string;
  ApproximateNumberOfMessagesDelayed: string;
  ApproximateNumberOfMessagesNotVisible: string;
  CreatedTimestamp: string;
  DelaySeconds: string;
  LastModifiedTimestamp: string;
  QueueArn: string;
  ReceiveMessageWaitTimeSeconds: string;
  VisibilityTimeout: string;
}

interface Queue {
  url: string;
  attributes: QueueAttributes;
}

export default Queue;
