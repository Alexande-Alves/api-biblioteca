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
      FROM
        livros l
      INNER JOIN
        autores a ON l.autor_id = a.id
    `;

    const { rows } = await pool.query(query);

    const livros = rows.map((livro) => {
      const { autor_id, autor_nome, autor_idade, ...info_livro } = livro;

      // Ajuste da data no formato "YYYY-MM-DD"
      const data_publicacao = new Date(info_livro.data_publicacao).toISOString().split('T')[0];

      return {
        ...info_livro,
        data_publicacao, // Utiliza a data formatada
        autor: {
          id: autor_id,
          nome: autor_nome,
          idade: autor_idade,
        },
      };
    });

    return res.json(livros);
  } catch (error) {
    console.error("Erro na função listarLivros:", error);
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

    const livroExistenteQuery = `
      SELECT * FROM livros 
      WHERE nome = $1
    `;
    const livroExistenteResult = await pool.query(livroExistenteQuery, [nome]);

    if (livroExistenteResult.rowCount > 0) {
      return res.status(400).json({ mensagem: "Livro já cadastrado" });
    }

    const livroQuery = `
      INSERT INTO livros (autor_id, nome, genero, editora, data_publicacao)
      VALUES ($1, $2, $3, $4, TO_DATE($5, 'YYYY-MM-DD'))
      RETURNING *
    `;
    const livroResult = await pool.query(livroQuery, [
      autorResult.rows[0].id,
      nome,
      genero,
      editora,
      data_publicacao,
    ]);

    const livroCadastrado = livroResult.rows[0];
    livroCadastrado.data_publicacao = data_publicacao.split('T')[0];

    return res.json(livroCadastrado);

    
  } catch (error) {
    console.error("Erro na função cadastrarLivro:", error);
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

    const livroExistenteQuery = `
      SELECT * FROM livros 
      WHERE nome = $1 AND id != $2
    `;
    const livroExistenteResult = await pool.query(livroExistenteQuery, [nome, id]);

    if (livroExistenteResult.rowCount > 0) {
      return res.status(400).json({ mensagem: "Livro já cadastrado para outro autor" });
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

    // Ajuste da data no formato "YYYY-MM-DD"
    const livroEditado = rows[0];
    livroEditado.data_publicacao = new Date(livroEditado.data_publicacao).toISOString().split('T')[0];

    return res.json({ mensagem: "Livro editado com sucesso", livro: livroEditado });
  } catch (error) {
    console.error("Erro na função editarLivro:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};


const buscarLivroPorId = async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se o livro existe
    const livroQuery = `SELECT * FROM livros WHERE id = $1`;
    const livroResult = await pool.query(livroQuery, [id]);

    if (livroResult.rowCount === 0) {
      return res.status(404).json({ mensagem: "Livro não encontrado" });
    }

    const livro = livroResult.rows[0];

    const autorQuery = `SELECT * FROM autores WHERE id = $1`;
    const autorResult = await pool.query(autorQuery, [livro.autor_id]);

    if (autorResult.rowCount === 0) {
      return res.status(404).json({ mensagem: "Autor do livro não encontrado" });
    }

    livro.data_publicacao = new Date(livro.data_publicacao).toISOString().split('T')[0];

    return res.json({ livro, autor: autorResult.rows[0] });
  } catch (error) {
    console.error("Erro na função buscarLivroPorId:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};


module.exports = {
  cadastrarLivro,
  listarLivros,
  deletarLivro,
  editarLivro,
  buscarLivroPorId,
};
