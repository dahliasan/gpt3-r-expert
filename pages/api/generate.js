import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)
const basePromptPrefix =
  'Provide a full detailed and specific example in R for following question. Make sure to explain why the recommended approach is appropriate in a way that is easy to understand and specific. If the question is related to statistics, also explain how to interpret the statistical outputs. Return the response as markdown and specify the code language as r. Question: '

const generateAction = async (req, res) => {
  // Run first prompt

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${basePromptPrefix}${req.body.userInput}`,
    temperature: 0.05,
    max_tokens: 1000,
  })

  const basePromptOutput = baseCompletion.data.choices.pop()

  res.status(200).json({ output: basePromptOutput })
}

export default generateAction
