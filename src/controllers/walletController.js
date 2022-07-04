import { db, objectId } from '../dbStrategy/mongo.js';
import joi from 'joi';
import dayjs from 'dayjs';


export async function getEntry(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  const session = await db.collection('sessions').findOne({ token });

  if (!session) {
    return res.sendStatus(401);
  }

  const DBentries = await db
    .collection('entries')
    .find({ userId: session.userId })
    .toArray();

  const entries= DBentries.filter(entry=>{
    const currentMonth=dayjs().format('MM');
    const currentYear=dayjs().format('YYYY');
    if(entry.date.substring(3,5)===currentMonth && entry.date.substring(6,10)===currentYear){
      return true;
    }
    else{
      return false;
    }
  });
  res.send(entries.reverse());
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


  if (!session) {
    return res.sendStatus(401);
  }


  await db.collection('entries').insertOne({ ...entry, userId: session.userId, date:dayjs(new Date(),'DD/MM/YYYY').format('DD/MM/YYYY') });
  res.status(201).send('Entrada criada com sucesso');
}
