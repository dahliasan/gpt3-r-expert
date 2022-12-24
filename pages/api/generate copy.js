import { Configuration, OpenAIApi } from 'openai'
import { charCountToTokenCount, wordCount } from '../../utils/gptTokenizer'
import { cleanAndChunkText } from '../../utils/chunkText'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const MAX_TOKENS = 3000
const openai = new OpenAIApi(configuration)
const basePromptPrefix =
  'Give me a max 250-word tldr of the following text. Do not include "tldr" in the response. Text: '

const generateAction = async (req, res) => {
  const { text } = req.body

  // Divide the text into chunks by paragraphs
  let chunks = cleanAndChunkText(text, 400)

  // Initialize an empty list to store the summaries
  let summaries = []

  // Iterate over the chunks
  for (const chunk of chunks) {
    console.log('1st iteration...')
    console.log('chunk length', chunk.length)
    const baseCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${basePromptPrefix}${chunk}\n`,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
    })

    // Extract the summary from the generated completions
    const summary = baseCompletion.data.choices.pop()

    // Add the summary to the list
    summaries.push(summary.text)
  }

  // Concatenate the summaries
  const combinedSummaries = summaries.join(' ')

  console.log(
    'combined summaries token count: ',
    charCountToTokenCount(combinedSummaries.length)
  )

  // If the combined summaries are too long, split and chunk again
  if (charCountToTokenCount(combinedSummaries.length) > 1000) {
    console.log('2nd loop...')
    let newChunks = cleanAndChunkText(combinedSummaries, 400)
    let newSummaries = []
    for (const chunk of newChunks) {
      console.log('chunk length', chunk.length)
      const baseCompletion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${basePromptPrefix}${chunk}\n`,
        temperature: 0.7,
        max_tokens: MAX_TOKENS,
      })

      // Extract the summary from the generated completions
      const summary = baseCompletion.data.choices.pop()

      // Add the summary to the list
      newSummaries.push(summary.text)
    }

    // Concatenate the new summaries
    const newCombinedSummaries = newSummaries.join(' ')

    // Recursively split and chunk until there is only one summary in the list
    return generateAction({ body: { text: newCombinedSummaries } }, res)
  }

  // If the combined summaries are not too long, generate a final summary using combined summaries as input
  if (charCountToTokenCount(combinedSummaries.length) <= 1000) {
    console.log('final generation...')
    const finalCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${basePromptPrefix}${combinedSummaries}\n`,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
    })
    const finalSummary = finalCompletion.data.choices.pop().text

    // Return the final summary
    res.status(200).json({ output: finalSummary })
  }
}

export default generateAction
