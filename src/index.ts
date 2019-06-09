import * as admin from "firebase-admin";
import { Maquina, Cliente, Instalacion, Protocolo } from "./types";

const serviceAccount = require("../service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const firestore = admin.firestore();
const maquinasRef = admin.firestore().collection("maquinas");
const clientesRef = admin.firestore().collection("clientes");
const instalacionesRef = admin.firestore().collection("instalaciones");
const protocolosRef = admin.firestore().collection("protocolos");

import { ApolloServer, gql, ApolloError, ValidationError } from "apollo-server";

const typeDefs = gql`
  type Cliente {
    id: ID!
    nombre: String!
    direccion: String!
    provincia: String!
    isla: String!
    email: String
    telefono: String
  }

  type Instalacion {
    id: ID!
    nombre: String!
    direccion: String!
    provincia: String!
    isla: String!
    clienteid: ID!
  }

  type Maquina {
    id: ID!
    instalacionid: ID!
    clienteid: ID!
    idm: String!
    idc: String
    tipo: String!
    imagentipo: String!
    imagenreal: String
    marca: String!
    modelo: String!
    nserie: String!
    anno: String!
    protocolo: Protocolo!
  }
  type Protocolo {
    id: ID!
    nombre: String!
    acciones: [String]
  }
  type Query {
    maquinas: [Maquina]
    maquinaById(id: ID!): Maquina
    maquinasDeCliente(cliente: ClienteInput): [Maquina]
    instalaciones: [Instalacion]
    instalacionById(id: ID!): Instalacion
    instalacionesDeCliente(cliente: ClienteInput): [Instalacion]
    clientes: [Cliente]
    clienteById(id: ID!): Cliente
    protocolos: [Protocolo]
    protocoloById(id: ID!): Protocolo
    protocoloByNombre(nombre: String!): [Protocolo]
  }

  # type Mutation {

  # }

  input ClienteInput {
    id: ID!
    nombre: String!
    direccion: String!
    email: String
    telefono: String
  }
`;

const resolvers = {
  Query: {
    async maquinas() {
      const maquinas = await maquinasRef.get();
      return maquinas.docs.map(maquina => {
        const id = maquina.id;
        return { id, ...maquina.data() };
      }) as Maquina[];
    },
    async maquinaById(_: null, args: { id: string }) {
      try {
        const maquinaDoc = await firestore.doc(`maquinas/${args.id}`).get();
        const maquina = maquinaDoc.data() as Maquina | undefined;
        return (
          maquina ||
          new ValidationError("No se ha encontrado ninguna máquina con ese ID")
        );
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async maquinasDeCliente(cliente: Cliente) {
      try {
        const clienteMaquinas = await maquinasRef
          .where("clienteid", "==", cliente.id)
          .get();
        return clienteMaquinas.docs.map(maquina => maquina.data()) as Maquina[];
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async clientes() {
      const clientes = await clientesRef.get();
      return clientes.docs.map(cliente => {
        const id = cliente.id;
        return { id, ...cliente.data() };
      });
    },
    async clienteById(_: null, args: { id: string }) {
      try {
        const clienteDoc = await firestore.doc(`clientes/${args.id}`).get();
        const cliente = clienteDoc.data() as Cliente | undefined;
        return (
          cliente ||
          new ValidationError("No se ha encontrado ningún clinete con ese ID")
        );
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async instalaciones() {
      const instalaciones = await instalacionesRef.get();
      return instalaciones.docs.map(instalacion => {
        const id = instalacion.id;
        return { id, ...instalacion.data() };
      });
    },
    async instalacionById(_: null, args: { id: string }) {
      try {
        const instDoc = await firestore.doc(`instalaciones/${args.id}`).get();
        const inst = instDoc.data() as Instalacion | undefined;
        return (
          inst ||
          new ValidationError(
            "No se ha encontrado ninguna instalación con ese ID"
          )
        );
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async instalacionesDeCliente(cliente: Cliente) {
      try {
        const clienteInstalaciones = await instalacionesRef
          .where("clienteid", "==", cliente.id)
          .get();
        return clienteInstalaciones.docs.map(instalacion =>
          instalacion.data()
        ) as Instalacion[];
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async protocolos() {
      const protocolos = await protocolosRef.get();
      return protocolos.docs.map(protocolo => {
        const id = protocolo.id;
        return { id, ...protocolo.data() };
      });
    },
    async protocoloById(_: null, args: { id: string }) {
      try {
        const protocoloDoc = await firestore.doc(`protocolos/${args.id}`).get();
        const protocolo = protocoloDoc.data() as Protocolo | undefined;
        return (
          protocolo ||
          new ValidationError("No se ha encontrado ningún protocolo con es ID")
        );
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async protocoloByNombre(_: null, args: { nombre: string }) {
      try {
        const protocolos = await protocolosRef
          .where("nombre", "==", args.nombre)
          .get();
        return protocolos.docs.map(protocolo =>
          protocolo.data()
        ) as Protocolo[];
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // engine: {
  //   apiKey: "service:alberpad-4052:7Np9_VGN74xcaGk7gbAi_A"
  // },
  introspection: true
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Apollo server ready at ${url}`);
});
