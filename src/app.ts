import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const mongoURI:string = process.env.MONGO_URI || 'mongodb://localhost:27017/chat';

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

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

// Definir el endpoint POST
app.post('/chat', async (req: Request, res: Response) => {
    const promptText = req.body.prompt;
    if (!promptText) {
        return res.status(400).send({ message: 'El campo "prompt" es necesario en el cuerpo de la solicitud.' });
    }

    try {
        const response = await queryChatGPT(promptText);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error al llamar a la API de OpenAI:', error);
        res.status(500).send({ message: 'Error al procesar la solicitud.' });
    }
});

async function queryChatGPT(promptText: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: promptText }]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    return data;
}


app.get('/', (req, res) => {
    res.send('Hola mundo Express y TypeScript desde node!');
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

export default app;
