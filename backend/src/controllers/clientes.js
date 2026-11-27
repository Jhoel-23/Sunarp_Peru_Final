import {obtenerClientes,crearClienteAdministrado} from '../services/clientes.js';
export async function listarClientes(req,res){res.json({clientes:await obtenerClientes()});}
export async function altaCliente(req,res){res.status(201).json({cliente:await crearClienteAdministrado(req.body)});}
