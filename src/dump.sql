create database biblioteca;

CREATE TABLE autores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    idade INTEGER NOT NULL
);

CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    genero VARCHAR(255),
    editora VARCHAR(255),
    data_publicacao DATE,
    autor_id INTEGER REFERENCES autores(id) ON DELETE CASCADE
);

TRUNCATE TABLE livros RESTART IDENTITY CASCADE;

TRUNCATE TABLE autores RESTART IDENTITY CASCADE;