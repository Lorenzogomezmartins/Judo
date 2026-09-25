import { importarResultadosFTP } from "./importarResultadoFTP.js";

const sincronizarResultadosFTPAutomatico = async () => {
  try {
    const resultado = await importarResultadosFTP();

    console.log(
      `[RESULTADOS FTP] Sincronización finalizada: ${JSON.stringify(resultado)}`
    );

    return resultado;
  } catch (error) {
    console.error(
      "[RESULTADOS FTP] Error en sincronización automática:",
      error.message
    );

    return {
      ok: false,
      error: error.message,
    };
  }
};

export default sincronizarResultadosFTPAutomatico;