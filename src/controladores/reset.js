const pool = require("../conector/conexao");

const reset = async (req, res) => {
  try {
    // Resetar dados da tabela livros
    await pool.query("TRUNCATE TABLE livros RESTART IDENTITY CASCADE");

    // Resetar dados da tabela autores
    await pool.query("TRUNCATE TABLE autores RESTART IDENTITY CASCADE");

    return res.json({ mensagem: "Banco de dados resetado com sucesso" });
  } catch (error) {
    console.error("Erro na função resetarBanco:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  reset,
};
