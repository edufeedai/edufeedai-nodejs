# Imagen base
FROM node:16

# Crea directorio de trabajo
WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm install

# Copia los archivos del proyecto
COPY . .

# Construye el proyecto
RUN npm run build

# Puerto que expone el contenedor
EXPOSE 3000

# Puerto para exponer el debugger
EXPOSE 9229

CMD ["node", "--inspect=0.0.0.0:9229", "dist/app.js"]