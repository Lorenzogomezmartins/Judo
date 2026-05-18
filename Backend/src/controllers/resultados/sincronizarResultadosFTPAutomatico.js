import sincronizarResultadosFTP from "./sincronizarResultadosFTP.js";

const sincronizarResultadosFTPAutomatico = async () => {
  const reqFake = {};

  const resFake = {
    status() {
      return this;
    },
    json(data) {
      console.log("✅ FTP automático:", data);
      return data;
    },
  };

  await sincronizarResultadosFTP(reqFake, resFake);
};

export default sincronizarResultadosFTPAutomatico;