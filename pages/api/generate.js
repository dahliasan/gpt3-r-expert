import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)
const basePromptPrefix =
  'Give me options for statistical analyses to answer the following question. Tell me the best analysis to do and why. Include example code in R to do the analysis and code for how I can check any test assumptions. Also tell me what I should look out for when checking assumptions. Question: '
const generateAction = async (req, res) => {
  // Run first prompt
  console.log(`API: ${basePromptPrefix}${req.body.userInput}`)

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${basePromptPrefix}${req.body.userInput}`,
    temperature: 0.8,
    max_tokens: 1000,
  })

  const basePromptOutput = baseCompletion.data.choices.pop()

  res.status(200).json({ output: basePromptOutput })
}

export default generateAction
