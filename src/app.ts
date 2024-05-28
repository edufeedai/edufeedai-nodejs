import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mongoose from 'mongoose';

import {Message} from './model/message';

// Cargar variables de entorno
dotenv.config();

// MongoDB URI
const mongoURI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/chat';

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

connectToMongo();

// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(express.json());

// Definición de los tipos de la respuesta de OpenAI
interface OpenAIChoice {
    message: {
        role: string;
        content: string;
    };
}

interface OpenAIResponse {
    choices: OpenAIChoice[];
}

// Ruta para iniciar un nuevo chat
app.post('/start-chat', async (req: Request, res: Response) => {
    const chatId = new mongoose.Types.ObjectId().toString();
    const systemMessage = new Message({ chatId, role: 'system', content: 'You are a helpful assistant.' });
    await systemMessage.save();
    res.json({ chatId });
});

app.post('/start-grading',async (req: Request, res: Response) => {
    const chatId = new mongoose.Types.ObjectId().toString();
    const {gradingCriteria,taskSubmitted} = req.body;
    const systemMessage = new Message({ chatId, role: 'system', content: gradingCriteria });
    await systemMessage.save();
    const userMessage = new Message({chatId, role: 'user', content: taskSubmitted})
    await userMessage.save();
    res.json({ chatId });
});

// Ruta para enviar un mensaje y obtener respuesta
app.post('/send-message', async (req: Request, res: Response) => {
    const { chatId, message } = req.body;

    // Almacenar el mensaje del usuario
    const userMessage = new Message({ chatId, role: 'user', content: message });
    await userMessage.save();

    // Obtener el historial del chat
    const messages = await Message.find({ chatId });

    // Formatear los mensajes para la API de OpenAI
    const formattedMessages = messages.map(m => ({ role: m.role, content: m.content }));

    // Llamar a la API de OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: formattedMessages
        })
    });

    const data: OpenAIResponse = await response.json() as OpenAIResponse;
    const assistantMessage = data.choices[0].message;

    // Almacenar la respuesta del asistente
    const botMessage = new Message({ chatId, role: 'assistant', content: assistantMessage.content });
    await botMessage.save();

    res.json(assistantMessage);
});

// Función para consultar a ChatGPT
async function queryChatGPT(messages: any) {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: messages
        })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch response from OpenAI');
    }

    const data:OpenAIResponse = await response.json() as OpenAIResponse;
    return data;
}

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
    res.send('Hola mundo Express y TypeScript desde node!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

export default app;
