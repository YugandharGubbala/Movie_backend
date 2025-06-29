const express = require('express')

const path = require('path')

const {open} = require('sqlite')

const splite3 = require('sqlite3')

const dbpath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let db = null

const server = async () => {
  try {
    db = await open({
      filename: dbpath,

      driver: splite3.Database,
    })

    app.listen(3000, () => {
      console.log('server running')
    })
  } catch (e) {
    console.log(`dberror : ${e.message}`)

    process.exit(1)
  }
}

server()

const movieconvert = dbobj => {
  return {
    movieId: dbobj.movie_id,

    directorId: dbobj.director_id,

    movieName: dbobj.movie_name,

    leadActor: dbobj.lead_actor,
  }
}
const directorconvert = dbobj => {
  return {
    directorId: dbobj.director_id,

    directorName: dbobj.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const moviesquery = `

    SELECT

      movie_name

    FROM

      movie

    ;`

  const playersarr = await db.all(moviesquery)

  response.send(playersarr.map(each => ({movieName: each.movie_name})))
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body

  const {directorId, movieName, leadActor} = movieDetails

  const addplayerQuery = `

    INSERT INTO

      movie (director_id,movie_name,lead_actor)

    VALUES

      (

        ${directorId},

         '${movieName}',

         '${leadActor}' 

      );`

  await db.run(addplayerQuery)

  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const moviequery = `

    SELECT

      *

    FROM

      movie

    WHERE

      movie_id=${movieId};`

  const playersarr = await db.get(moviequery)

  response.send(movieconvert(playersarr))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const {directorId, movieName, leadActor} = request.body

  const addUpdatedQuery = `

    UPDATE

       movie

    SET
        director_id=${directorId},

         movie_name='${movieName}',

         lead_actor='${leadActor}'

    WHERE

         movie_id=${movieId}

      ;`

  await db.run(addUpdatedQuery)

  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteQuery = `

    DELETE FROM

      movie
    WHERE

         movie_id=${movieId}

      ;`

  await db.run(deleteQuery)

  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const moviesquery = `

    SELECT

      *

    FROM

      director

    ;`

  const playersarr = await db.all(moviesquery)

  response.send(
    playersarr.map(each => ({
      directorId: each.director_id,
      directorName: each.director_name,
    })),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const moviesquery = `

    SELECT

      movie_name

    FROM

       movie
    WHERE
      director_id = ${directorId}

    ;`

  const playersarr = await db.all(moviesquery)

  response.send(
    playersarr.map(each => ({
      movieName: each.movie_name,
    })),
  )
})

module.exports = app
