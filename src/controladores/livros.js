const pool = require("../conector/conexao");

const listarLivros = async (req, res) => {
  try {
    const query = `
            SELECT
                l.id,
                l.nome,
                l.genero,
                l.data_publicacao,
                l.autor_id,
                a.nome AS autor_nome,
                a.idade AS autor_idade
            from
                livros l
            inner join
                autores a ON l.autor_id = a.id
        `;

    const { rows } = await pool.query(query);

    const livros = rows.map((livro) => {
      const { autor_id, autor_nome, autor_idade, ...info_livro } = livro;
      return {
        ...info_livro,
        autor: {
          id: autor_id,
          nome: autor_nome,
          idade: autor_idade,
        },
      };
    });

    return res.json(livros);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const cadastrarLivro = async (req, res) => {
  const { id } = req.params;
  const { nome, genero, editora, data_publicacao } = req.body;

  if (!nome || !genero || !editora || !data_publicacao) {
    return res.status(400).json({ mensagem: "Dados incompletos ou inválidos" });
  }

  try {
    const autorQuery = `SELECT * FROM autores WHERE id = $1`;
    const autorResult = await pool.query(autorQuery, [id]);

    if (autorResult.rowCount === 0) {
      return res.status(404).json({ mensagem: "O autor não existe" });
    }

    const livroQuery = `
      INSERT INTO livros (autor_id, nome, genero, editora, data_publicacao)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const livroResult = await pool.query(livroQuery, [
      autorResult.rows[0].id,
      nome,
      genero,
      editora,
      data_publicacao,
    ]);

    return res.json(livroResult.rows);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const deletarLivro = async (req, res) => {
  const { id } = req.params;

  try {
    const livroQuery = "DELETE FROM livros WHERE id = $1 RETURNING *";
    const { rowCount, rows } = await pool.query(livroQuery, [id]);

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "O livro não existe" });
    }

    return res.json({ mensagem: "Livro deletado com sucesso" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const editarLivro = async (req, res) => {
  const { id } = req.params;
  const { nome, genero, editora, data_publicacao } = req.body;

  if (!nome || !genero || !editora || !data_publicacao) {
    return res.status(400).json({ mensagem: "Dados incompletos ou inválidos" });
  }

  try {
    const autorQuery = `SELECT * FROM autores WHERE id = $1`;
    const autorResult = await pool.query(autorQuery, [id]);

    if (autorResult.rowCount === 0) {
      return res.status(404).json({ mensagem: "O autor não existe" });
    }

    const livroQuery = `
      UPDATE livros
      SET nome = $1, genero = $2, editora = $3, data_publicacao = $4
      WHERE id = $5
      RETURNING *
    `;

    const { rowCount, rows } = await pool.query(livroQuery, [
      nome,
      genero,
      editora,
      data_publicacao,
      id,
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "O livro não existe" });
    }

    return res.json({ mensagem: "Livro editado com sucesso", livro: rows[0] });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};



module.exports = {
  cadastrarLivro,
  listarLivros,
  deletarLivro,
  editarLivro,
};
