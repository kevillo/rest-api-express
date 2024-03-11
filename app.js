const express = require('express')
const movies = require('./movies.json')
const Crypto = require('node:crypto')
const cors = require('cors')
const { validateMovie, validatePartial } = require('./schemas/movies')

const app = express()
app.use(express.json())
app.use(cors()) // para arreglar el cors pero pone un * ❌ cuidado
app.disable('x-powered-by') // deshabilita la cabecera X-Powered-By: Express -> se recomienda deshabilitar por seguridad

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://localhost:3000'
]
// rutas por get
app.get('/', (req, res) => {
  res.json({ message: 'a' })
})
app.get('/movies', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  const { Genre } = req.query
  if (Genre) {
    const filteredMovie = movies.filter(
      movie => movie.genre.some(g => g.toLocaleLowerCase() === Genre.toLocaleLowerCase())
    )
    res.json(filteredMovie)
  }
  res.send(movies)
})
app.get('/movies/:id', (req, res) => { // path to regex
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'movie not found' })
})

// rutas por get

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ errors: result.error })
  }
  // esto se enviara a bases de datos
  const newMovie = {
    id: Crypto.randomUUID(),
    ...result.data
  }

  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartial(req.body)

  if (result.error) {
    return res.status(400).json({ errors: result.error })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')
  }
  res.sendStatus(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('escuchando en http://localhost:' + PORT)
})
