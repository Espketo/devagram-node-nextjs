import type {NextApiRequest, NextApiResponse} from 'next';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import type {LoginResposta} from '../../types/LoginResposta';
import md5 from 'md5';
import { UsuarioModel } from '../../models/UsuarioModels'; 
import jwt from 'jsonwebtoken';

const endpointLogin = async (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMsg | LoginResposta>
) => {

    const {MINHA_CHAVE_JWT} = process.env;
    if(!MINHA_CHAVE_JWT){
        return res.status(500).json({erro: 'ENV Jwt nao informado'});
    }

    if(req.method === 'POST'){
        const {login, senha} = req.body;

        const usuariosEncontrado = await UsuarioModel.find({email:login, senha:md5(senha)});

        if(usuariosEncontrado && usuariosEncontrado.length > 0){
                const usuarioEncontrado = usuariosEncontrado[0];

                const token = jwt.sign({_id : usuarioEncontrado._id}, MINHA_CHAVE_JWT);
                return res.status(200).json({
                    nome : usuarioEncontrado.nome,
                    email : usuarioEncontrado.email,
                    token});
        }
        return res.status(400).json({erro : 'Usuário ou senha não encontrado'});
    }    
    return res.status(405).json({erro : 'Metodo informado não é valido'});
}   

export default conectarMongoDB(endpointLogin);