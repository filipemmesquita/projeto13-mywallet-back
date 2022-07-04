import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { db } from '../dbStrategy/mongo.js';
import joi from 'joi';

export async function createUser(req, res) {
  const user = req.body;

  const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const { error } = userSchema.validate(user);

  if (error) {
    return res.sendStatus(422);
  }

  try {
    const nameAlreadyExistis= await db.collection('users').findOne({name:user.name})
    const emailAlreadyExistis= await db.collection('users').findOne({email:user.email})
    if(nameAlreadyExistis||emailAlreadyExistis){
        res.sendStatus(422);
        return;
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  } 
  


  const encryptedPassword = bcrypt.hashSync(user.password, 10);

  await db.collection('users').insertOne({ ...user, password: encryptedPassword });
  res.status(201).send('User created successfully');
}

export async function loginUser(req, res) {
  const user = req.body;
  const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const { error } = userSchema.validate(user);

  if (error) {
    return res.sendStatus(422);
  }

  const DBUser = await db.collection('users').findOne({ email: user.email });
  if (DBUser && bcrypt.compareSync(user.password, DBUser.password)) {
    const token = uuid();


    await db.collection('sessions').insertOne({
      token,
      userId: DBUser._id
    });

    return res.status(201).send({ token, name:DBUser.name });
  } else {
    return res.status(401).send('Senha ou email incorretos!');
  }
}

export async function logoutUser(req,res){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  const session = await db.collection('sessions').findOne({ token });

  if (!session) {
    return res.sendStatus(401);
  }


  await db.collection('sessions').deleteMany({ _id: session._id });
  res.status(201).send('Session ended successfully');
}
