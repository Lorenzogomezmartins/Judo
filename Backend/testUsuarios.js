// Backend/testConImagenDeClubes.js
import FormData from "form-data";
import fs from "fs";

const test = async () => {
  console.log("=== TEST CON IMAGEN QUE FUNCIONA EN CLUBES ===\n");
  
  const form = new FormData();
  form.append("nombre", "Maria");
  form.append("apellido", "Gomez");
  form.append("dni", "87654321");
  form.append("email", "maria@test.com");
  form.append("telefono", "123456789");
  form.append("sexo", "femenino");
  form.append("peso", "65.2");
  form.append("clasificacion", "cadete");
  
  // Usar la misma imagen que funciona en clubes
  const imagePath = "C:\\Users\\MIPC\\OneDrive\\Escritorio\\lolo proye\\Judo\\Frontend\\assets\\Clubes\\AJA.jpeg";
  
  if (!fs.existsSync(imagePath)) {
    console.log("❌ Imagen no encontrada:", imagePath);
    return;
  }
  
  const stats = fs.statSync(imagePath);
  console.log("📸 Imagen encontrada:");
  console.log("   Ruta:", imagePath);
  console.log("   Tamaño:", stats.size, "bytes");
  console.log("   Extensión:", imagePath.split('.').pop());
  
  form.append("ft", fs.createReadStream(imagePath));

  console.log("\n📤 Enviando petición...");
  
  try {
    const res = await fetch("http://localhost:4000/api/usuarios", {
      method: "POST",
      body: form,
      headers: form.getHeaders()
    });

    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Respuesta:", data);
    
    if (data.usuario && data.usuario.ft) {
      console.log("\n✅ ÉXITO! Foto guardada como:", data.usuario.ft);
      console.log("📍 Ubicación: Frontend/assets/usuarios/" + data.usuario.ft);
    } else if (data.usuario) {
      console.log("\n⚠️ Usuario creado pero sin foto");
      console.log("   ft:", data.usuario.ft);
    } else {
      console.log("\n❌ Error:", data.mensaje);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
};

test();