const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generarToken } = require("../utils/jwt");
const Proyecto = require("../models/Proyecto");
const Tarea = require("../models/Tarea");

const resolvers = {
  Query: {
    obtenerProyectos: async (_, {}, ctx) => {
      try {
        const proyectos = await Proyecto.find({ creador: ctx.id });
        return proyectos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerTareas: async (_, { input }, ctx) => {
      const tareas = await Tarea.find({ creador: ctx.id })
        .where("proyecto")
        .equals(input.proyecto);
      return tareas;
    },
  },
  Mutation: {
    crearUsuario: async (_, { input }) => {
      const { email, password } = input;
      const existeUsuario = await User.findOne({ email });
      // si el usuario existe
      if (existeUsuario) {
        throw new Error("El usuario ya se encuentra registrado");
      }
      try {
        //hashear password
        const salt = await bcrypt.genSaltSync(10);
        input.password = await bcrypt.hashSync(password, salt);

        //registrar usuario
        const nuevoUsuario = new User(input);
        nuevoUsuario.save();
        return "Usuario creado correctamente";
      } catch (error) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;
      //revisar si el usuario exixte
      const usuarioExiste = await User.findOne({ email });
      if (!usuarioExiste) throw new Error("El usuario no se ha registrado aun");

      //revisar si el password es correcto
      const validarPassword = await bcrypt.compare(
        password,
        usuarioExiste.password
      );
      if (!validarPassword)
        throw new Error("El email y la contraseña no coinciden");

      //generar token
      const token = await generarToken(usuarioExiste);

      //dar acceso a la app
      return {
        token,
      };
    },
    nuevoProyecto: async (_, { input }, ctx) => {
      try {
        const nuevoProyecto = new Proyecto(input);
        //asociar creador
        nuevoProyecto.creador = ctx.id;
        // almacenar proyecto
        const resultado = await nuevoProyecto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },

    actualizarProyecto: async (_, { id, input }, ctx) => {
      //revisar que el proyecto existe
      let proyecto = await Proyecto.findById(id);
      if (!proyecto) throw new Error("El proyecto no existe");
      //revisar que quien lo edita es correcto
      if (proyecto.creador.toString() !== ctx.id) {
        throw new Error("No tiene permisos para modificar el proyecto");
      }
      //guardar proyecto
      proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return proyecto;
    },
    eliminarProyecto: async (_, { id }, ctx) => {
      try {
        //validar si existe proyecto
        const proyecto = await Proyecto.findById(id);
        if (!proyecto) throw new Error("El proyecto no existe");

        //Revisar que tiene permisos
        if (proyecto.creador.toString() !== ctx.id) {
          throw new Error("No tiene permisos para esta accion");
        }

        //Eliminar proyecto
        await Proyecto.findByIdAndDelete({ _id: id });
        return "Proyecto eliminado exitosamente";
      } catch (error) {
        console.log(error);
      }
    },
    nuevaTarea: async (_, { input }, ctx) => {
      try {
        const tarea = new Tarea(input);
        tarea.creador = ctx.id;
        const resultado = await tarea.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarTarea: async (_, { id, input, estado }, ctx) => {
      try {
        //Revisar que la tarea existe
        let tarea = await Tarea.findById(id);
        console.log(tarea);
        if (!tarea) throw new Error("Tarea no encontrada");
        //Revisar permisos
        if (tarea.creador.toString() !== ctx.id)
          throw new Error("No tiene permisos para editar esta tarea");
        //Asingnar estado
        input.estado = estado;
        //Guardar Tarea
        tarea = await Tarea.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });
        return tarea;
      } catch (error) {
        console.log(error);
      }
    },
    eliminarTarea: async (_, { id }, ctx) => {
      try {
        const tarea = await Tarea.findById(id);
        //Validar que existe la tarea
        if (!tarea) throw new Error("La tarea no existe");
        //Permisos
        if (tarea.creador.toString() !== ctx.id)
          throw new Error("No tiene permiso para eliminar la tarea");
        //Eliminar Tarea
        await Tarea.findOneAndDelete({ _id: id });
        return "Ha eliminado la tarea";
      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = resolvers;
