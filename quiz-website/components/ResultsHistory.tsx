"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface QuizResult {
  id: string
  language: string
  score: number
  totalQuestions: number
  date: string
  answers: {
    question: string
    userAnswer: string | null
    correctAnswer: string
    isCorrect: boolean
    explanation: string
  }[]
}

interface ResultsHistoryProps {
  onBackToHome: () => void
}

export default function ResultsHistory({ onBackToHome }: ResultsHistoryProps) {
  const [results, setResults] = useState<QuizResult[]>([])
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    try {
      const storedResults = localStorage.getItem("quizResults")
      if (storedResults) {
        setResults(JSON.parse(storedResults))
      }
    } catch (error) {
      console.error("Failed to load quiz results from localStorage:", error)
      setResults([])
    }
  }, [])

  const handleViewResult = (result: QuizResult) => {
    setSelectedResult(result)
  }

  const handleBackToResults = () => {
    setSelectedResult(null)
  }

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your quiz history?")) {
      try {
        localStorage.removeItem("quizResults")
      } catch (error) {
        console.error("Failed to clear quiz results from localStorage:", error)
      }
      setResults([])
      setSelectedResult(null)
    }
  }

  const calculateOverallProgress = () => {
    try {
      // Calculate progress across all languages
      const progress: { [key: string]: Set<string> } = {
        c: new Set(),
        python: new Set(),
        java: new Set(),
        coding: new Set(),
      }

      // Track unique questions answered correctly per language
      results.forEach((result) => {
        const language = result.language
        if (progress[language]) {
          result.answers.forEach((answer) => {
            if (answer.isCorrect) {
              progress[language].add(answer.question)
            }
          })
        }
      })

      // Calculate total progress
      let totalQuestions = 0
      let totalAnswered = 0

      Object.keys(progress).forEach((lang) => {
        totalQuestions += 75 // 75 questions per language
        totalAnswered += Math.min(progress[lang].size, 75) // Cap at 75 per language
      })

      return {
        percentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0,
        answered: totalAnswered,
        total: totalQuestions,
      }
    } catch (error) {
      console.error("Failed to calculate progress:", error)
      return { percentage: 0, answered: 0, total: 0 }
    }
  }

  const overallProgress = calculateOverallProgress()

  if (selectedResult) {
    return (
      <div className="flex flex-col items-center min-h-screen py-2 bg-lightBlue">
        <div className="w-full max-w-4xl px-4">
          <Card className="mb-8 bg-white shadow-lg">
            <CardHeader className="bg-pistaGreen text-customBlack rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedResult.language} Test Result</CardTitle>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{overallProgress.percentage}%</span>
                    </div>
                    <Progress value={overallProgress.percentage} className="h-2" />
                    <p className="text-xs mt-1">
                      {overallProgress.answered} of {overallProgress.total} questions mastered across all quizzes
                    </p>
                  </div>
                  <CardDescription className="text-darkBlue font-medium">
                    Taken on {new Date(selectedResult.date).toLocaleString()}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleBackToResults}
                  className="bg-white text-darkBlue border-darkBlue hover:bg-lightBlue/30"
                >
                  Back to Results
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <p className="text-lg font-semibold text-darkBlue">
                  Score: {selectedResult.score} / {selectedResult.totalQuestions} (
                  {Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}%)
                </p>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="bg-lightBlue">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-pistaGreen data-[state=active]:text-customBlack"
                  >
                    All Questions
                  </TabsTrigger>
                  <TabsTrigger
                    value="correct"
                    className="data-[state=active]:bg-pistaGreen data-[state=active]:text-customBlack"
                  >
                    Correct Answers
                  </TabsTrigger>
                  <TabsTrigger
                    value="incorrect"
                    className="data-[state=active]:bg-pistaGreen data-[state=active]:text-customBlack"
                  >
                    Incorrect Answers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="max-h-[60vh] overflow-y-auto">
                  {selectedResult.answers.map((answer, index) => (
                    <div key={index} className="mb-6 p-4 border rounded-md bg-white shadow">
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${answer.isCorrect ? "bg-pistaGreen text-customBlack" : "bg-red-100 text-red-700"}`}
                        >
                          {answer.isCorrect ? "✓" : "✗"}
                        </div>
                        <div>
                          <p className="font-semibold text-darkBlue">
                            {index + 1}. {answer.question}
                          </p>
                          <p className="mt-2">Your answer: {answer.userAnswer || "Not answered"}</p>
                          {!answer.isCorrect && (
                            <p className="mt-1 text-pistaGreen font-medium">Correct answer: {answer.correctAnswer}</p>
                          )}
                          <p className="mt-2 text-gray-600">{answer.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="correct" className="max-h-[60vh] overflow-y-auto">
                  {selectedResult.answers
                    .filter((a) => a.isCorrect)
                    .map((answer, index) => (
                      <div key={index} className="mb-6 p-4 border rounded-md bg-white shadow">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-pistaGreen text-customBlack flex items-center justify-center">
                            ✓
                          </div>
                          <div>
                            <p className="font-semibold text-darkBlue">
                              {selectedResult.answers.indexOf(answer) + 1}. {answer.question}
                            </p>
                            <p className="mt-2">Your answer: {answer.userAnswer}</p>
                            <p className="mt-2 text-gray-600">{answer.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="incorrect" className="max-h-[60vh] overflow-y-auto">
                  {selectedResult.answers
                    .filter((a) => !a.isCorrect)
                    .map((answer, index) => (
                      <div key={index} className="mb-6 p-4 border rounded-md bg-white shadow">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                            ✗
                          </div>
                          <div>
                            <p className="font-semibold text-darkBlue">
                              {selectedResult.answers.indexOf(answer) + 1}. {answer.question}
                            </p>
                            <p className="mt-2">Your answer: {answer.userAnswer || "Not answered"}</p>
                            <p className="mt-1 text-pistaGreen font-medium">Correct answer: {answer.correctAnswer}</p>
                            <p className="mt-2 text-gray-600">{answer.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2 bg-lightBlue">
      <div className="w-full max-w-4xl px-4">
        <Card className="mb-8 bg-white shadow-lg">
          <CardHeader className="bg-pistaGreen text-customBlack rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle>Quiz Results History</CardTitle>
              <Button
                variant="outline"
                onClick={onBackToHome}
                className="bg-white text-darkBlue border-darkBlue hover:bg-lightBlue/30"
              >
                Back to Home
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {results.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No quiz results found. Take a quiz to see your results here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-lightBlue">
                      <TableHead className="text-darkBlue">Date</TableHead>
                      <TableHead className="text-darkBlue">Language</TableHead>
                      <TableHead className="text-darkBlue">Score</TableHead>
                      <TableHead className="text-darkBlue">Percentage</TableHead>
                      <TableHead className="text-right text-darkBlue">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id} className="hover:bg-lightBlue/30">
                        <TableCell>{new Date(result.date).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{result.language}</TableCell>
                        <TableCell>
                          {result.score} / {result.totalQuestions}
                        </TableCell>
                        <TableCell>{Math.round((result.score / result.totalQuestions) * 100)}%</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResult(result)}
                            className="bg-lemonGreen text-customBlack hover:bg-lemonGreen/80 border-none"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {results.length > 0 && (
            <CardFooter className="flex justify-end">
              <Button variant="destructive" onClick={clearHistory} className="bg-red-500 hover:bg-red-600">
                Clear History
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

