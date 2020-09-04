const assistant = require('../models/AssistantModel');
const { typeMessages, systemRelevance } = require('../config/environment.test');
const UnderstandingController = require('./UnderstandingController');
const QuestionController = require('./QuestionController');
const NeedsAnswerController = require('./NeedsAnswerController');
const TranslatorController = require('./TranslatorController');
const WikipediaController = require("./WikipediaController");
require('dotenv').config();

module.exports = {
    async startConversation (req, res, next) {
        try {
            const { result } = await assistant.message({
                workspaceId: process.env.WORKSPACE_ID
            })
            
            res.status(200).json({
                type: typeMessages.start_conversation_answer,
                response: result
            });
        } catch (error) {
            console.log('[ERROR!] Fail at AssistantController.js in startConversation function.', error);
            next(error)
        }
    },

    /**
     * Lida com a conversa, analisando o contexto e fazendo a tratativa necessária 
     * de acordo com as intenções.
     * @param {*} req Dados da requisição
     * @param {*} res Dados para a resposta
     * @param {*} next Próxima middleware (tratativa de erro)
     */
    async DealConversation (req, res, next) {
        const { context, input } = req.body;
        
        try {
    
            let payload = {
                workspaceId: process.env.WORKSPACE_ID,
                context: context.context || {},
                input: input || {}
            }
        
            // Consulta o Watson Assistant passando como parametro dados da conversa
            const { result } = await assistant.message(payload)

            if (result.intents.length) {
                // Se a intenção for relacionado a uma dúvida
                if (result.intents[0].intent === "duvida") {
                    let categoriesArray = []
                    let validaCategory = false;                 

                    const { text } = result.input;
    
                    // Faz a tradução do conteúdo para o ingles, para que seja analisado com mais precisão
                    const textInEnglish = await TranslatorController.translate(text);

                    console.log('>>> Text In English ->', textInEnglish);

                    // Faz a analise pelo Watson NLU
                    const analysisResults = await UnderstandingController.getUnderstanding(textInEnglish)
                    const { keywords, categories } = analysisResults.result;

                    console.log('>>> categories ->', categories);

                    // Faz a validação do contexto da pergunta enviada pelo aluno
                    categories.forEach(category => {
                        category.label.split('/').forEach(split => {
                            if (split) categoriesArray.push(split)
                        })
                    })

                    for (var i in context.categories) {
                        if (categoriesArray.find(x => x === context.categories[i])) {
                            validaCategory = true;
                            break;
                        } 
                    }

                    if (!validaCategory) {
                        res.status(200).json({
                            type: typeMessages.not_allowed
                        })
                        return;
                    }

                    Object.assign(context, { keywords, originalQuestion: text });
                    const resposta = await QuestionController.findAnswer(context, systemRelevance);   

                    if (resposta) {
                        // Se tiver encontrado uma resposta, retorna ela.
                        res.status(200).json({
                            type: typeMessages.db_answer,
                            response: resposta
                        })

                        return;
                    } else {
                        // Consulta a palavra-chave na API da Wikipedia
                        const wikipediaSentences = await WikipediaController.getWikipediaSentences(keywords[0].text)
                        const sentence = wikipediaSentences[0] + ' ' + wikipediaSentences[1];

                        // Retorna o conteúdo encontrado para português
                        const backToPortuguese = await TranslatorController.translate(sentence, 'pt')
                        
                        const finalResult =  {
                            originalQuestion: text,
                            text: backToPortuguese,
                            keywords
                        };
        
                        // Retorno da requisição
                        res.status(200).json({
                            type: typeMessages.question_success,
                            response: finalResult
                        })
                        return;
                    }
                } 

                // Tratativa da resposta de "A resposta foi útil?"
                if (context.foiUtil) {
                    if (result.entities[0].value === 'sim') {
                        // Resposta útil, segue a vida
                        res.status(200).json({
                            type: typeMessages.util
                        })

                        return;
                    } else {
                        // Consulta no banco de dados todas as respostas salvas e analisa de acordo com a relevancia
                        // para que seja encontrada uma resposta correta já registrada ou não.

                        console.log('context', context);

                        const resposta = await QuestionController.findAnswer(context, systemRelevance);

                        if (resposta) {
                            // Se tiver encontrado uma resposta, retorna ela.
                            res.status(200).json({
                                type: typeMessages.db_answer,
                                response: resposta
                            })

                            return;
                        } else {
                            // Se não tiver encontrado a resposta, salva a pergunta no banco como uma questão sem resposta.
                            NeedsAnswerController.store({
                                question: context.originalQuestion,
                                keywords: JSON.stringify(context.keywords)
                            })

                            res.status(200).json({
                                type: typeMessages.not_found
                            })

                            return;
                        }
                    }
                }
            } 

            // Se for uma pergunta onde o chatbot pode responder dentro de seu próprio contexto.
            res.status(200).json({
                type: typeMessages.chat_answer,
                response: result
            });
        } catch (error) {
            // Tratativa de erro

            // Caso o erro retornado seja nenhum resultado encontrado, cadastra a pergunta automaticamente no banco.
            if (error.errorType === 'No Result!') {

                // Se não tiver encontrado a resposta, salva a pergunta no banco como uma questão sem resposta.
                NeedsAnswerController.store({
                    question: context.originalQuestion,
                    keywords: JSON.stringify(context.keywords)
                })

                res.status(200).json({
                    type: typeMessages.not_found
                })

                return;

            } else {
                console.log('[ERROR!] Fail at AssistantController.js in DealConversation function.', error);
                next(error)
            }
        }
    }
}