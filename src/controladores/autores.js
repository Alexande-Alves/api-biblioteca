const pool = require("../conector/conexao");

const cadastrarAutor = async (req, res) => {
  const { nome, idade } = req.body;

  if (!nome || !idade) {
    return res.status(400).json({ mensagem: "Nome e idade são obrigatórios" });
  }

  if (typeof idade !== "number" || isNaN(idade)) {
    return res
      .status(400)
      .json({ mensagem: "A idade deve ser um número válido" });
  }

  try {
    const verificaAutorQuery = "SELECT * FROM autores WHERE nome = $1";
    const autorExistente = await pool.query(verificaAutorQuery, [nome]);

    if (autorExistente.rows.length > 0) {
      return res.status(400).json({ mensagem: "Autor já cadastrado" });
    }

    const inserirAutorQuery =
      "INSERT INTO autores (nome, idade) VALUES ($1, $2) RETURNING *";
    const { rows } = await pool.query(inserirAutorQuery, [nome, idade]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro na função cadastrarAutor:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const listarAutores = async (req, res) => {
  try {
    const query = "SELECT * FROM autores";
    const { rows } = await pool.query(query);

    const autores = rows.map((autor) => ({
      id: autor.id,
      nome: autor.nome,
      idade: autor.idade,
    }));

    return res.json(autores);
  } catch (error) {
    console.error("Erro na função listarAutores:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const deletarAutor = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se existem livros associados ao autor
    const livrosQuery = "SELECT * FROM livros WHERE autor_id = $1";
    const livrosResult = await pool.query(livrosQuery, [id]);

    if (livrosResult.rowCount > 0) {
      // Se existem livros, informar que o autor não pode ser excluído
      return res.status(400).json({
        mensagem:
          "O autor não pode ser deletado porque possui livros cadastrados. Para deletar o autor, exclua antes seus livros.",
      });
    }

    // Agora, exclua o autor
    const autorQuery = "DELETE FROM autores WHERE id = $1";
    const { rowCount } = await pool.query(autorQuery, [id]);

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "O autor não existe" });
    }

    return res.json({ mensagem: "Autor deletado com sucesso" });
  } catch (error) {
    console.error("Erro na função deletarAutor:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarAutor = async (req, res) => {
  const { id } = req.params;
  const { nome, idade } = req.body;

  if (!nome || !idade) {
    return res.status(400).json({ mensagem: "Dados incompletos ou inválidos" });
  }

  const verificaAutorQuery = "SELECT * FROM autores WHERE nome = $1";
  const autorExistente = await pool.query(verificaAutorQuery, [nome]);

  if (autorExistente.rows.length > 0) {
    return res.status(400).json({ mensagem: "Autor já cadastrado" });
  }

  try {
    const autorQuery = "SELECT * FROM autores WHERE id = $1";
    const autorResult = await pool.query(autorQuery, [id]);

    if (autorResult.rowCount === 0) {
      return res.status(404).json({ mensagem: "O autor não existe" });
    }

    const editarAutorQuery = `
      UPDATE autores
      SET nome = $1, idade = $2
      WHERE id = $3
      RETURNING *
    `;

    const { rowCount, rows } = await pool.query(editarAutorQuery, [
      nome,
      idade,
      id,
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "O autor não existe" });
    }

    return res.json({ mensagem: "Autor editado com sucesso", autor: rows[0] });
  } catch (error) {
    console.error("Erro na função editarAutor:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const exibirAutorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
        SELECT 
          a.id,
          a.nome,
          a.idade,
          l.id AS livro_id,
          l.nome AS livro_nome,
          l.genero AS livro_genero, 
          l.editora AS livro_editora, 
          l.data_publicacao AS livro_data_publicacao 
        FROM autores a 
        INNER JOIN livros l ON a.id = l.autor_id 
        WHERE a.id = $1
    `;
    const { rowCount, rows } = await pool.query(query, [id]);

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "O autor não existe" });
    }

    const livros = rows.map((livro) => ({
      id: livro.livro_id,
      nome: livro.livro_nome,
      genero: livro.livro_genero,
      editora: livro.livro_editora,
      data_publicacao: livro.livro_data_publicacao,
    }));

    const autor = {
      id: rows[0].id,
      nome: rows[0].nome,
      idade: rows[0].idade,
      livros,
    };

    return res.json(autor);
  } catch (error) {
    console.error("Erro na função exibirAutorPorId:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  cadastrarAutor,
  listarAutores,
  deletarAutor,
  editarAutor,
  exibirAutorPorId,
};
