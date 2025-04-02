"use client"

import { useState, useEffect } from "react"
import Quiz from "@/components/Quiz"
import ResultsHistory from "@/components/ResultsHistory"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Import JSON data
import cQuizData from "../data/c-quiz.json"
import pythonQuizData from "../data/python-quiz.json"
import javaQuizData from "../data/java-quiz.json"
import codingQuizData from "../data/coding-quiz.json"

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [showingResults, setShowingResults] = useState(false)

  // Fixed the TypeScript syntax for useState
  const [progressData, setProgressData] = useState<{ [key: string]: number }>({
    c: 0,
    python: 0,
    java: 0,
    coding: 0,
  })

  useEffect(() => {
    try {
      // Load quiz results from localStorage
      const storedResults = localStorage.getItem("quizResults")
      if (storedResults) {
        const results = JSON.parse(storedResults)

        // Calculate progress for each language
        const progress: { [key: string]: Set<string> } = {
          c: new Set(),
          python: new Set(),
          java: new Set(),
          coding: new Set(),
        }

        // Track unique questions answered per language
        results.forEach((result: any) => {
          const language = result.language
          if (progress[language]) {
            result.answers.forEach((answer: any) => {
              if (answer.isCorrect) {
                progress[language].add(answer.question)
              }
            })
          }
        })

        // Calculate percentage (out of 75 max questions)
        const progressPercentage: { [key: string]: number } = {}
        Object.keys(progress).forEach((lang) => {
          progressPercentage[lang] = Math.min(100, Math.round((progress[lang].size / 75) * 100))
        })

        setProgressData(progressPercentage)
      }
    } catch (error) {
      console.error("Failed to load quiz progress:", error)
    }
  }, [])

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    setShowingResults(false)
  }

  const handleBackToHome = () => {
    setSelectedLanguage(null)
    setShowingResults(false)
  }

  const handleViewResults = () => {
    setShowingResults(true)
    setSelectedLanguage(null)
  }

  if (showingResults) {
    return <ResultsHistory onBackToHome={handleBackToHome} />
  }

  if (selectedLanguage) {
    let questions

    switch (selectedLanguage) {
      case "c":
        questions = cQuizData
        break
      case "python":
        questions = pythonQuizData
        break
      case "java":
        questions = javaQuizData
        break
      case "coding":
        questions = codingQuizData
        break
      default:
        questions = []
    }

    return <Quiz questions={questions} language={selectedLanguage} onBackToHome={handleBackToHome} />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center w-full flex-1 px-4 md:px-20 text-center">
        <h1 className="text-5xl font-bold mt-4 text-darkBlue mb-2">Programming Quiz</h1>
        <p className="text-xl mt-3 mb-8 text-customBlack">Test your programming knowledge</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mt-6 w-full">
          {["c", "python", "java", "coding"].map((language, index) => (
            <div key={language} className="flex flex-col">
              <Button
                onClick={() => handleLanguageSelect(language)}
                className={`p-10 text-center bg-white hover:bg-white/90 text-darkBlue rounded-xl shadow-lg transition-all hover:shadow-xl border-2 border-pistaGreen animate-float`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {language.charAt(0).toUpperCase() + language.slice(1)} Quiz
                  </h2>
                  <p className="text-sm opacity-70">Test your {language} programming skills</p>
                </div>
              </Button>
              <div className="mt-2 px-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{progressData[language] || 0}%</span>
                </div>
                <Progress value={progressData[language] || 0} className="h-2" />
                <p className="text-xs text-center mt-1 text-gray-600">
                  {progressData[language]
                    ? `${Math.round(progressData[language] * 0.75)} of 75 questions mastered`
                    : "Not started yet"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleViewResults}
          variant="outline"
          className="mt-12 flex items-center gap-2 bg-darkBlue text-white hover:bg-darkBlue/80 px-6 py-5 rounded-full shadow-md"
        >
          <History size={18} />
          View Results History
        </Button>
      </main>
    </div>
  )
}

