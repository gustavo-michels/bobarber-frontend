import { takeLatest, call, put, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import api from '~/services/api';
import history from '~/services/history';
import { signInSuccess, signFailure } from './actions';

export function* signIn({ payload }) {
  try {
    const { email, password } = payload;

    const response = yield call(api.post, 'sessions', { email, password });

    const { token, user } = response.data;

    if (!user.provider) {
      toast.error('Este usuário não tem permissão de acesso ao sistema.');
      yield put(signFailure());
      return;
    }

    api.defaults.headers.Authorization = `Bearer ${token}`;

    yield put(signInSuccess(token, user));
    history.push('/dashboard');
  } catch (error) {
    toast.error('Falha na autenticação, verifique seus dados.');
    yield put(signFailure());
  }
}

export function* signUp({ payload }) {
  try {
    const { name, email, password, confirmPassword } = payload;

    yield call(api.post, 'users', {
      name,
      email,
      password,
      confirmPassword,
      provider: true,
    });

    history.push('/');
  } catch (error) {
    toast.error('Falha no cadastro, verifique seus dados!');
    console.tron.log(error);

    yield put(signFailure);
  }
}

function setToken({ payload }) {
  if (!payload) return;

  const { token } = payload.auth;

  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
}

export default all([
  takeLatest('persist/REHYDRATE', setToken),
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SIGN_UP_REQUEST', signUp),
]);
