import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';

const app = express();
app.use(bodyParser.json());

const prisma = new PrismaClient();

const delay = () => new Promise(res => setTimeout(() => res(null), 2000))

app.post('/messages', async (req: Request, res: Response) => {
  try {
    const { content: msgContent } = req.body;

    await prisma.message.create({
      data: {
        content: msgContent,
        source: 'client',
      },
    });

    const { id, content, source } = await prisma.message.create({
      data: {
        content: [...msgContent].reverse().join(''),
        source: 'server',
      },
    });

    await delay()

    res.status(201).json({ id, content, source });
  } catch (error) {
    console.error('Error saving message to the database:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/messages', async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany();
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error retrieving messages from the database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
