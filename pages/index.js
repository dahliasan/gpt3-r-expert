import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import MarkdownRenderer from '../components/markdownRenderer'
import buildspaceLogo from '../assets/buildspace-logo.png'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Home = () => {
  let placeholderInput =
    'what is a statistical test that would allow me to analyse the number of chicks vs the average temperature to see if there is any correlation.'

  const [userInput, setUserInput] = useState('')
  const [apiOutput, setApiOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const callGenerateEndpoint = async () => {
    setIsGenerating(true)

    console.log('Calling OpenAI...')
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: userInput || placeholderInput }),
    })

    const data = await response.json()
    const { output } = data
    console.log('OpenAI replied...', output.text)

    setApiOutput(`${output.text}`)
    setIsGenerating(false)
  }

  const onUserChangedText = (event) => {
    setUserInput(event.target.value)
  }

  return (
    <div className="root">
      <Head>
        <title>AI R Expert</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Get answers to your R questions instantly</h1>
          </div>
          <div className="header-subtitle">
            <h2>Ask a question and get answers with examples to do it in R</h2>
          </div>
        </div>
        <div className="prompt-container">
          <div className="prompt-box-container">
            <textarea
              placeholder={placeholderInput}
              className="prompt-box"
              value={userInput}
              onChange={onUserChangedText}
            />
          </div>

          <div className="prompt-buttons">
            <a
              className={
                isGenerating ? 'generate-button loading' : 'generate-button'
              }
              onClick={callGenerateEndpoint}
            >
              <div className="generate">
                {isGenerating ? (
                  <span className="loader"></span>
                ) : (
                  <p>Ask 🙏</p>
                )}
              </div>
            </a>
          </div>
          {apiOutput && (
            <div className="output">
              <div className="output-header-container">
                <div className="output-header">
                  <h3>🌈 Here's your answer 🌈 </h3>
                </div>
              </div>
              <div className="output-content">
                <MarkdownRenderer markdown={apiOutput} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-writer"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Home
