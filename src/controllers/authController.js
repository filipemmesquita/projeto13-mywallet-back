import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { db } from '../dbStrategy/mongo.js';
import joi from 'joi';

export async function createUser(req, res) {
  const user = req.body;
  console.log(user)

  const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const { error } = userSchema.validate(user);

  if (error) {
    console.log("joi error")
    return res.sendStatus(422);
  }

  const encryptedPassword = bcrypt.hashSync(user.password, 10);

  await db.collection('users').insertOne({ ...user, password: encryptedPassword });
  res.status(201).send('User created successfully');
}

export async function loginUser(req, res) {
  const user = req.body;
  console.log(user)
  const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const { error } = userSchema.validate(user);

  if (error) {
    console.log("joi error")
    return res.sendStatus(422);
  }

  const DBUser = await db.collection('users').findOne({ email: user.email });
  console.log(DBUser)
  if (DBUser && bcrypt.compareSync(user.password, DBUser.password)) {
    const token = uuid();

    await db.collection('sessions').insertOne({
      token,
      userId: user._id
    });

    return res.status(201).send({ token });
  } else {
    return res.status(401).send('Senha ou email incorretos!');
  }
}
