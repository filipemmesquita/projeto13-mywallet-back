import { db, objectId } from '../dbStrategy/mongo.js';
import joi from 'joi';

export async function getEntry(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  const session = await db.collection('sessions').findOne({ token });

  if (!session) {
    return res.sendStatus(401);
  }

  const entries = await db
    .collection('entries')
    .find({ userId: session.userId })
    .toArray();

  res.send(entries);
}

export async function createEntry(req, res) {
  const entry = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  const entrySchema = joi.object({
    title: joi.string().required(),
    value: joi.number().required(),
    type: joi.string().valid('expense','income').required()
  });

  const { error } = entrySchema.validate(entry);

  if (error) {
    return res.sendStatus(422);
  }

  const session = await db.collection('sessions').findOne({ token });

  console.log(session)

  if (!session) {
    return res.sendStatus(401);
  }


  await db.collection('entries').insertOne({ ...entry, userId: session.userId });
  res.status(201).send('Entrada criada com sucesso');
}
