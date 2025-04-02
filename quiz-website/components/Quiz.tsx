"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Clock } from "lucide-react"

interface QuizProps {
  questions: {
    question: string
    options: string[]
    answer: string
    explanation: string
  }[]
  language: string
  onBackToHome: () => void
}

export default function Quiz({ questions, language, onBackToHome }: QuizProps) {
  // Select 15-20 random questions from the pool
  const [quizQuestions, setQuizQuestions] = useState<typeof questions>([])
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([])
  const [quizFinished, setQuizFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20 * 60) // 20 minutes in seconds
  const [isConfirmQuitOpen, setIsConfirmQuitOpen] = useState(false)

  // Select random questions on component mount
  useEffect(() => {
    selectRandomQuestions()
  }, [questions])

  // Select 15-20 random questions from the pool
  const selectRandomQuestions = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    // Select 20 random questions from the pool of up to 75
    const numQuestions = Math.min(20, shuffled.length)
    const selected = shuffled.slice(0, numQuestions)
    setQuizQuestions(selected)
    setSelectedAnswers(Array(selected.length).fill(null))
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Timer effect
  useEffect(() => {
    if (quizFinished) return

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizFinished])

  const handleAnswerSelection = (questionIndex: number, answer: string) => {
    const newSelectedAnswers = [...selectedAnswers]
    newSelectedAnswers[questionIndex] = answer
    setSelectedAnswers(newSelectedAnswers)
  }

  // Update the handleSubmit function to track unique questions answered correctly
  const handleSubmit = () => {
    let newScore = 0

    const quizResults = {
      id: Date.now().toString(),
      language,
      score: 0,
      totalQuestions: quizQuestions.length,
      date: new Date().toISOString(),
      answers: quizQuestions.map((question, index) => {
        const isCorrect = selectedAnswers[index] === question.answer
        if (isCorrect) newScore++

        return {
          question: question.question,
          userAnswer: selectedAnswers[index],
          correctAnswer: question.answer,
          isCorrect,
          explanation: question.explanation,
        }
      }),
    }

    quizResults.score = newScore
    setScore(newScore)

    // Save result to localStorage
    try {
      const storedResults = localStorage.getItem("quizResults")
      const results = storedResults ? JSON.parse(storedResults) : []
      results.unshift(quizResults) // Add new result at the beginning
      localStorage.setItem("quizResults", JSON.stringify(results))
    } catch (error) {
      console.error("Failed to save quiz results to localStorage:", error)
    }

    setQuizFinished(true)
  }

  const handleQuit = () => {
    setIsConfirmQuitOpen(true)
  }

  const confirmQuit = () => {
    onBackToHome()
  }

  const cancelQuit = () => {
    setIsConfirmQuitOpen(false)
  }

  const handleTryAgain = () => {
    selectRandomQuestions()
    setQuizFinished(false)
    setScore(0)
    setTimeLeft(20 * 60)
  }

  // Function to format code in question text
  const formatCodeInQuestion = (question: string) => {
    // Split the question by newlines
    const lines = question.split("\n")

    if (lines.length <= 1) {
      // No code block, return the question as is
      return {
        questionText: question,
        codeBlock: null,
      }
    }

    // First line is the question text
    const questionText = lines[0]

    // Rest of the lines form the code block
    const codeBlock = lines.slice(1).join("\n")

    return {
      questionText,
      codeBlock,
    }
  }

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardHeader className="bg-pistaGreen text-customBlack rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Quiz Completed!</CardTitle>
            <CardDescription className="text-darkBlue font-medium">Your final score:</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg">
              You scored {score} out of {quizQuestions.length} on the {language} quiz.
            </p>
            <p className="mt-2 font-bold text-xl">Percentage: {Math.round((score / quizQuestions.length) * 100)}%</p>

            <div className="mt-4">
              <Progress value={(score / quizQuestions.length) * 100} className="h-3" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleTryAgain} className="bg-lemonGreen text-customBlack hover:bg-lemonGreen/80">
              Try Again
            </Button>
            <Button onClick={onBackToHome} className="bg-darkBlue text-white hover:bg-darkBlue/80">
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isConfirmQuitOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardHeader className="bg-pistaGreen text-customBlack rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Quit Quiz?</CardTitle>
            <CardDescription className="text-darkBlue font-medium">
              Are you sure you want to quit? Your progress will be lost.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={cancelQuit}
              className="border-darkBlue text-darkBlue hover:bg-lightBlue/30"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmQuit} className="bg-red-500 hover:bg-red-600">
              Quit
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardHeader className="bg-pistaGreen text-customBlack rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Loading Quiz...</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Please wait while we prepare your questions.</p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={onBackToHome} className="bg-darkBlue text-white hover:bg-darkBlue/80">
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const answeredCount = selectedAnswers.filter((answer) => answer !== null).length
  const progressPercentage = (answeredCount / quizQuestions.length) * 100

  return (
    <div className="flex flex-col items-center min-h-screen py-2">
      <div className="w-full max-w-4xl px-4">
        <div className="sticky top-0 py-4 flex justify-between items-center z-10 bg-white/80 backdrop-blur-sm rounded-lg mb-4">
          {/* Back button is now hidden once quiz starts */}
          <div>
            {/* Quit button replaces back button */}
            <Button
              variant="outline"
              onClick={handleQuit}
              className="flex items-center gap-1 text-red-500 border-red-500 hover:bg-red-100"
            >
              <X size={16} />
              Quit Quiz
            </Button>
          </div>
          <div className="text-xl font-bold text-darkBlue bg-pistaGreen px-4 py-2 rounded-md flex items-center gap-2">
            <Clock size={18} />
            Time Left: {formatTime(timeLeft)}
          </div>
          <div className="invisible">
            {/* Invisible element to maintain flex spacing */}
            <Button variant="outline">
              <X size={16} />
              Spacer
            </Button>
          </div>
        </div>

        <Card className="mb-8 bg-white shadow-lg">
          <CardHeader className="bg-pistaGreen text-customBlack rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{language} Test</CardTitle>
                <CardDescription className="text-darkBlue font-medium">
                  Answer all {quizQuestions.length} questions
                </CardDescription>
              </div>
              <div className="text-sm text-darkBlue font-medium">
                {answeredCount} of {quizQuestions.length} answered
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 mt-2" />
          </CardHeader>

          <CardContent className="max-h-[60vh] overflow-y-auto pt-6">
            {quizQuestions.map((question, questionIndex) => {
              // Format code in question if it exists
              const { questionText, codeBlock } = formatCodeInQuestion(question.question)

              return (
                <div key={questionIndex} className="mb-8 border-b pb-6">
                  <h3 className="text-xl font-semibold mb-4 text-darkBlue">
                    {questionIndex + 1}. {questionText}
                  </h3>

                  {/* Display code if it exists */}
                  {codeBlock && (
                    <div className="mb-4 bg-gray-800 rounded-md overflow-hidden">
                      <div className="bg-gray-700 px-4 py-2 text-xs text-gray-200">{language}</div>
                      <pre className="p-4 overflow-x-auto text-gray-200 font-mono text-sm">{codeBlock}</pre>
                    </div>
                  )}

                  <div className="grid gap-2 mt-4">
                    {question.options.map((option) => (
                      <Button
                        key={option}
                        variant={selectedAnswers[questionIndex] === option ? "secondary" : "outline"}
                        onClick={() => handleAnswerSelection(questionIndex, option)}
                        className={`justify-start text-left ${
                          selectedAnswers[questionIndex] === option
                            ? "bg-pistaGreen text-customBlack hover:bg-pistaGreen/80"
                            : "border-darkBlue text-darkBlue hover:bg-lightBlue/30"
                        }`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>

          <CardFooter className="flex justify-between sticky bottom-0 bg-white border-t p-4">
            <div className="text-darkBlue font-medium">
              {selectedAnswers.filter((answer) => answer !== null).length} of {quizQuestions.length} questions answered
            </div>
            <Button onClick={handleSubmit} className="bg-darkBlue text-white hover:bg-darkBlue/80">
              Submit Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

