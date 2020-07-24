import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';

const AUTENTICAR_USUARIO = gql`
  mutation autenticarUsuario($input: AutenticarInput) {
    autenticarUsuario(input: $input) {
      token
    }
  }
`;

const login = () => {
  //mutation para crear nuevos usuarios en apollo
  const [autenticarUsuario] = useMutation(AUTENTICAR_USUARIO);

  //state para el mensaje
  const [mensaje, guardarMensaje] = useState(null);

  //usar router
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('El email no es valido')
        .required('El email no puede ir vacio'),
      password: Yup.string().required('El password es obligatorio')
    }),
    onSubmit: async (valores) => {
      console.log(valores);

      const { email, password } = valores;
      try {
        const { data } = await autenticarUsuario({
          variables: {
            input: {
              email,
              password
            }
          }
        });

        guardarMensaje('Autenticando...');

        //guardar token en ls
        const { token } = data.autenticarUsuario;

        localStorage.setItem('token', token);

        //redireccionar a cliente
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (error) {
        // console.log(error.message);cs
        guardarMensaje(error.message);
        setTimeout(() => {
          guardarMensaje(null);
        }, 1500);
      }
    }
  });

  const mostrarMensaje = () => {
    return (
      <div className='bg-white py-2 px-3 w-full my-3 max-w-sm text-center mx-auto'>
        <p>{mensaje}</p>
      </div>
    );
  };

  return (
    <>
      <Layout>
        <h1 className='text-center text-2xl text-white font-light'>LOGIN</h1>
        {mensaje && mostrarMensaje()}
        <div className='flex justify-center mt-5'>
          <div className='w-full max-w-sm'>
            <form
              className='bg-white rounded shadowmd px-8 pt-6 pb-8 mb-4'
              onSubmit={formik.handleSubmit}
            >
              <div className='mb-4'>
                <label
                  className='block text-gray-700 text--sm font-bold mb-2'
                  htmlFor='email'
                >
                  Email
                </label>
                <input
                  className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='email'
                  type='email'
                  placeholder='Email'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
              </div>
              {formik.touched.email && formik.errors.email ? (
                <div className='my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4'>
                  <p className='font-bold'>Error</p>
                  <p>{formik.errors.email}</p>
                </div>
              ) : null}
              <div className='mb-4'>
                <label
                  className='block text-gray-700 text--sm font-bold mb-2'
                  htmlFor='password'
                >
                  Password
                </label>
                <input
                  className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='password'
                  type='password'
                  placeholder='Password'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className='my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4'>
                  <p className='font-bold'>Error</p>
                  <p>{formik.errors.password}</p>
                </div>
              ) : null}
              <input
                type='submit'
                className='bg-gray-800 w-full mt-5 p-2 text-white uppercase hover:bg-gray-900'
                value='Iniciar Sesión'
              />
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default login;
