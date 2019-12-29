import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import authConfig from '../../config/auth';
import User from '../models/User';

class SessionControler {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Dados inválidos, verifique login e senha!' });
    }

    const { email, password } = req.body;

    // Verifica se o usuário existe
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não existe' });
    }

    // Verifica se a senha está correta
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha inválida!' });
    }

    const { id, name } = user; // já temos o email do FindOne

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionControler();