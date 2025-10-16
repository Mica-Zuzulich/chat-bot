import OpenAI from "openai";
import readline from "readline";

// Configurar entrada por consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Crear cliente de OpenAI
const client = new OpenAI({
});

async function preguntar() {
  rl.question("👩‍💻 Vos: ", async (mensaje) => {
    if (mensaje.toLowerCase() === "salir") {
      console.log("👋 ¡Chau Mica!");
      rl.close();
      return;
    }

    const respuesta = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: mensaje }]
    });

    console.log("🤖 Bot:", respuesta.choices[0].message.content);
    preguntar();
  });
}

preguntar();
