const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {
  // console.log(usuario);
  const { id, email, nombre, apellido } = usuario;

  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
};

const resolvers = {
  Query: {
    obtenerUsuario: async (_, {}, ctx) => {
      return ctx.usuario;
      // const usuarioId = await jwt.verify(token, process.env.SECRETO);
      // return usuarioId;
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      //revisar si el producto existe o no
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error('producto no encontrado');
      }
      return producto;
    },
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({
          vendedor: ctx.usuario.id.toString()
        });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      //revisar si el cliente existe
      const cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error('No existe el cliente');
      }
      //quien lo creo puede verlo
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No es tu usuario');
      }

      return cliente;
    },
    obtenerPedidos: async () => {
      try {
        const pedidos = await Pedido.find({});
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_, {}, ctx) => {
      try {
        const pedidos = await Pedido.find({ vendedor: ctx.usuario.id });
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedido: async (_, { id }, ctx) => {
      //el el pedido existe o noç
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      //solo quien lo creo puede verlo
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No cuentas con las credenciales');
      }
      //retorna el resultado
      return pedido;
    },
    obtenerPedidosEstado: async (_, { estado }, ctx) => {
      const pedidos = await Pedido.find({
        vendedor: ctx.usuario.id,
        estado: estado
      });

      return pedidos;
    },
    mejoresClientes: async () => {
      const clientes = await Pedido.aggregate([
        { $match: { estado: 'COMPLETADO' } },
        {
          $group: {
            _id: '$cliente',
            total: { $sum: '$total' }
          }
        },
        {
          $lookup: {
            from: 'clientes',
            localField: '_id',
            foreignField: '_id',
            as: 'cliente'
          }
        },
        {
          $limit: 10
        },
        {
          $sort: { total: -1 }
        }
      ]);

      return clientes;
    },
    mejoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: { estado: 'COMPLETADO' } },
        {
          $group: {
            _id: '$vendedor',
            total: { $sum: '$total' }
          }
        },
        {
          $lookup: {
            from: 'usuarios',
            localField: '_id',
            foreignField: '_id',
            as: 'vendedor'
          }
        },
        {
          $limit: 3
        },
        {
          $sort: { total: -1 }
        }
      ]);
      return vendedores;
    },
    buscarProducto: async (_, { texto }) => {
      const productos = await Producto.find({ $text: { $search: texto } });
      return productos;
    }
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      //revisar que no estre registrado
      const { email, password } = input;
      const existeUsuario = await Usuario.findOne({ email });
      // console.log(('Existe usuario', existeUsuario));
      if (existeUsuario) {
        throw new Error('El usuario ya esta registrado');
      }

      //hashear el password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      //guardarlo en la db
      try {
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;
      const existeUsuario = await Usuario.findOne({ email });
      //Si el usuario existe
      if (!existeUsuario) {
        throw new Error('El usuario no existe');
      }
      //Revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );
      if (!passwordCorrecto) {
        throw new Error('Password incorrecto');
      }
      //crear el token
      return {
        token: crearToken(existeUsuario, process.env.SECRETO, '24h')
      };
    },
    nuevoProducto: async (_, { input }) => {
      try {
        const nuevoProducto = new Producto(input);

        //almacenar en db
        const resultado = await nuevoProducto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      //revisar si el producto existe
      let producto = await Producto.findById(id);
      if (!producto) {
        throw new Error('producto no encontrado');
      }
      //guardar el producto en la db
      producto = await Producto.findOneAndUpdate({ _id: id }, input, {
        new: true
      });

      return producto;
    },
    eliminarProducto: async (_, { id }) => {
      //revisar si el producto existe
      let producto = await Producto.findById(id);
      if (!producto) {
        throw new Error('producto no encontrado');
      }
      await Producto.findOneAndDelete({ _id: id });
      return 'Producto Eliminado';
    },
    nuevoCliente: async (_, { input }, ctx) => {
      console.log(ctx);

      const { email } = input;
      //verificar si el cliente ya esta registrado
      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error('Ese cliente ya está registrado');
      }
      const nuevoCliente = new Cliente(input);

      //asignarle el vendedor
      nuevoCliente.vendedor = ctx.usuario.id;
      //guardarlo
      try {
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_, { id, input }, ctx) => {
      //verificar si existe o no
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error('El cliente no existe ');
      }

      //verificar si el vendedor es quien edita
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No es tu usuario');
      }
      //guardar el cliente
      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true
      });

      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx) => {
      //verificar si existe o no
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error('El cliente no existe ');
      }

      //verificar si el vendedor es quien edita
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No es tu usuario');
      }
      //eliminar cliente
      await Cliente.findOneAndDelete({ _id: id });
      return 'Cliente Eliminado';
    },
    nuevoPedido: async (_, { input }, ctx) => {
      const { cliente } = input;
      //verificar el el cliente existe o no
      let clienteExiste = await Cliente.findById(cliente);
      if (!clienteExiste) {
        throw new Error('El cliente no existe ');
      }

      //verificar si el cliente es del vendedor
      if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No es tu usuario');
      }
      //revisar que el stock está disponible
      for await (const articulo of input.pedido) {
        const { id } = articulo;
        const producto = await Producto.findById(id);
        // console.log(producto);
        if (articulo.cantidad > producto.existencia) {
          throw new Error(
            `El articulo: ${producto.nombre} excede la cantidad disponible`
          );
        } else {
          producto.existencia = producto.existencia - articulo.cantidad;
          await producto.save();
        }
      }

      //crear un pedido nuevo
      const nuevoPedido = new Pedido(input);

      //asignarle un vendedor ctx
      nuevoPedido.vendedor = ctx.usuario.id;
      //guardar en db
      const resultado = await nuevoPedido.save();
      return resultado;
    },
    actualizarPedido: async (_, { id, input }, ctx) => {
      const { cliente } = input;
      // si el pedido existe
      const existePedido = await Pedido.findById(id);
      if (!existePedido) {
        throw new Error('el pedido no existe');
      }
      //si el cliente existe
      const existeCliente = await Cliente.findById(cliente);
      if (!existeCliente) {
        throw new Error('el cliente no existe');
      }

      ///si el cliente y el pedido pertenece al vendedor
      //verificar si el vendedor es quien edita
      if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No es tu usuario');
      }
      //revisar el stock
      if (input.pedido) {
        for await (const articulo of input.pedido) {
          const { id } = articulo;
          const producto = await Producto.findById(id);
          // console.log(producto);
          if (articulo.cantidad > producto.existencia) {
            throw new Error(
              `El articulo: ${producto.nombre} excede la cantidad disponible`
            );
          } else {
            producto.existencia = producto.existencia - articulo.cantidad;
            await producto.save();
          }
        }
      }

      //guardar el pedido
      const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, {
        new: true
      });
      return resultado;
    },
    eliminarPedido: async (_, { id }, ctx) => {
      //verificar si el pedido existe o no
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Error('El pedido no existe');
      }

      //verificar si el vendedor es quien lo borr-a

      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales');
      }

      //Eliminar de la db

      await Pedido.findOneAndDelete({ _id: id });
      return 'Pedido eliminado';
    }
  }
};

module.exports = resolvers;
