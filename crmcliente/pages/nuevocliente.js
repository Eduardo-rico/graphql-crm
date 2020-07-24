import React from 'react';
import Layout from '../components/Layout';

const NuevoCliente = () => {
  return (
    <Layout>
      <h1 className='text-2xl text-gray-800 font-ligth'>Nuevo cliente</h1>
      <div className='flex justify-center mt-5'>
        <div className='w-full max-w-lg'>
          <form class='bg-white shadow-md px-8 pt-6 pb-8 mb-4 '></form>
        </div>
      </div>
    </Layout>
  );
};

export default NuevoCliente;
