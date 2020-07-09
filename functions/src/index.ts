import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firestore-chart-3380f.firebaseio.com"
});

const db = admin.firestore();
// Método para exponer los datos a traves de funcion
// export const getGOTY = functions.https.onRequest( async (request, response) => {
  
//   const gotyRef = db.collection('goty');
//   const docsSnap = await gotyRef.get();

//   const games = docsSnap.docs.map( doc => doc.data() );

//   response.json( games );
// });

// Express
const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, res) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();

  const games = docsSnap.docs.map( doc => doc.data() );

  res.json( games );
});

app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection('goty').doc( id );
  const gameSnap = await gameRef.get();

  if ( !gameSnap.exists ) 
    res.status(404).json({
      ok: false,
      message: `game not found with ID: ${id}`
    });

  const beforeGameRef = gameSnap.data() || { votes: 0 };
  await gameRef.update({
    votes: ++beforeGameRef.votes
  });

  res.json({ 
    ok: true,
    message: `Thank you for voting ${beforeGameRef.name}`
  })
});

export const api = functions.https.onRequest( app );