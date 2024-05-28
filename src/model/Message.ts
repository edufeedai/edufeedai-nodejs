import mongoose, { Document, Schema } from 'mongoose';

// Definición de la interfaz para el documento de mensaje
export interface IMessage extends Document {
    chatId: string;
    role: string;
    content: string;
}

// Definición del esquema de Mongoose para el mensaje
const messageSchema: Schema = new Schema({
    chatId: { type: String, required: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
});

// Creación y exportación del modelo de Mongoose para el mensaje
export const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message