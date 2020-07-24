import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/router';

const OBTENER_USUARIO = gql`
  query obtenerUsuario {
    obtenerUsuario {
      id
      nombre
      apellido
    }
  }
`;

const Header = () => {
  const { data, loading, error } = useQuery(OBTENER_USUARIO);

  //proteger que no accedamos a data antes de tener resultados
  if (loading) return null;

  //si no hay información
  if (!data) {
    return router.push('/login');
  }

  const { nombre, apellido } = data.obtenerUsuario;

  //
  const router = useRouter();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className='flex justify-between mb-6'>
      <p className='mr-2'>
        Hola: {nombre} {apellido}
      </p>
      <button
        onClick={() => cerrarSesion()}
        className='bg-blue-800 w-full sm:w-auto font-bold uppercase text-xs rounded py-1 px-2 text-white shadow-md'
        type='button'
      >
        Cerrar sesion
      </button>
    </div>
  );
};

export default Header;
