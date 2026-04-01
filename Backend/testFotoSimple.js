// Backend/testFotoGrande.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "form-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseURL = "http://localhost:4000/api/usuarios";

const testFotoGrande = async () => {
  console.log("\n=== TEST CON FOTO GRANDE ===\n");

  // Usar tu imagen PNG real
  const imagePath = "C:\\Users\\MIPC\\OneDrive\\Imágenes\\doyhe.png";
  
  if (!fs.existsSync(imagePath)) {
    console.log("❌ Imagen no encontrada");
    return;
  }
  
  const stats = fs.statSync(imagePath);
  const sizeMB = stats.size / (1024 * 1024);
  
  console.log("1. Verificando imagen...");
  console.log("   Ruta:", imagePath);
  console.log("   Tamaño:", sizeMB.toFixed(2), "MB");
  
  if (sizeMB > 10) {
    console.log("   ⚠️ La imagen es mayor a 10MB, puede fallar si no aumentaste los límites");
  }
  console.log();

  console.log("2. Creando FormData...");
  const formData = new FormData();
  formData.append("nombre", "TestGrande");
  formData.append("apellido", "Imagen");
  formData.append("dni", "99999999");
  formData.append("email", "grande@test.com");
  formData.append("telefono", "999999999");
  formData.append("sexo", "masculino");
  formData.append("peso", "70");
  formData.append("clasificacion", "senior");
  formData.append("ft", fs.createReadStream(imagePath));
  console.log("   ✅ FormData creado\n");

  console.log("3. Enviando petición POST...");
  const startTime = Date.now();
  
  try {
    const response = await fetch(baseURL, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders()
    });

    const endTime = Date.now();
    console.log("   Tiempo:", (endTime - startTime) / 1000, "segundos");
    console.log("   Status:", response.status);
    
    const text = await response.text();
    console.log("   Respuesta:", text);
    
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {}
    
    if (json && (json.usuario || json._id)) {
      const user = json.usuario || json;
      console.log("\n✅ ÉXITO!");
      console.log("   ID:", user._id);
      console.log("   Nombre:", user.nombre);
      console.log("   Foto guardada:", user.ft);
    } else if (json && json.mensaje) {
      console.log("\n⚠️ Error:", json.mensaje);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  
  console.log("\n=== FIN TEST ===\n");
};

testFotoGrande();