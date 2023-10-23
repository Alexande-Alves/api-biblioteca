const { Router } = require("express");

const rotas = Router();

const {
  cadastrarAutor,
  exibirAutorPorId,
  listarAutores,
  deletarAutor,
  editarAutor,
} = require("../controladores/autores");

const {
  cadastrarLivro,
  listarLivros,
  deletarLivro,
  editarLivro,
  buscarLivroPorId,
} = require("../controladores/livros");

const { reset } = require("../controladores/reset");

rotas.post("/autor", cadastrarAutor);
rotas.get("/autor/:id", exibirAutorPorId);
rotas.get("/autor", listarAutores);
rotas.delete("/autor/:id", deletarAutor);
rotas.patch("/autor/:id", editarAutor);

rotas.post("/livros/:id/livro", cadastrarLivro);
rotas.get("/livros", listarLivros);
rotas.delete("/livros/:id", deletarLivro);
rotas.patch("/livros/:id", editarLivro);
rotas.get("/livros/:id", buscarLivroPorId);

rotas.post("/reset", reset);

module.exports = rotas;
