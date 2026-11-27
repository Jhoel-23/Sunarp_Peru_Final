import {login,registro} from '../services/auth.js';
// Una petición sigue Route -> Controller -> Service -> Repository -> PostgreSQL (Neon).
export async function iniciarSesion(req,res){res.json(await login(req.body));}
export async function registrarUsuario(req,res){res.status(201).json(await registro(req.body));}
export async function perfilActual(req,res){res.json({usuario:req.usuario});}
