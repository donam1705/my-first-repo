import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendVerificationEmail, sendResetPasswordEmail } from '@/lib/sendmail';

const redisOptions = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
};

export const connection = new IORedis(redisOptions);

export const emailQueue = new Queue('emailQueue', { connection });

export const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    console.log('Email Worker xử lý job:', job.name, job.data.email);

    const { email, token } = job.data;

    if (job.name === 'sendVerifyEmail') {
      await sendVerificationEmail({ email, token });
    }

    if (job.name === 'sendResetEmail') {
      await sendResetPasswordEmail({ email, token });
    }

    console.log('Đã xử lý xong công việc:', job.name);
  },
  { connection }
);
