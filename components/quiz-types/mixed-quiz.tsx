"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QuizResults } from "@/components/quiz-results"
import { createClient } from "@/lib/supabase/client"
import { shuffleArray } from "@/lib/array-utils"
import { ArrowLeft, ArrowRight, HelpCircle, AlertCircle } from "lucide-react"
import type { Tables } from "@/lib/supabase/database.types"

type QuizProps = {
  quiz: Tables<"quizzes"> & {
    categories: Tables<"categories"> | null
    profiles: Pick<Tables<"profiles">, "username" | "display_name" | "avatar_url"> | null
  }
  questions: Tables<"questions">[]
}

export function MixedQuiz({ quiz, questions: originalQuestions }: QuizProps) {
  // Shuffle questions on component mount
  const [questions] = useState(() => shuffleArray(originalQuestions))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<Record<number, string>>({})
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit || 60)
  const [isFinished, setIsFinished] = useState(false)
  const [startTime] = useState<number>(Date.now())
  const [showHint, setShowHint] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const currentQuestion = questions[currentQuestionIndex]
  const isMultipleChoice =
    currentQuestion?.question_type === "multiple-choice" || currentQuestion?.type === "multiple-choice"
  const isFillBlank = currentQuestion?.question_type === "fill-blank" || currentQuestion?.type === "fill-blank"
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Get options for multiple choice questions
  const getOptions = () => {
    if (!isMultipleChoice) return []

    const options = currentQuestion?.options
    if (!options) return []

    // If options is an array of objects with text property
    if (typeof options === "object" && options.length > 0 && typeof options[0] === "object" && "text" in options[0]) {
      return options.map((opt: any) => opt.text)
    }

    // If options is already a string array
    return options as string[]
  }

  const options = getOptions()

  // Timer effect
  useEffect(() => {
    if (isFinished) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isFinished])

  // Focus input when switching to a fill-blank question
  useEffect(() => {
    if (isFillBlank && inputRef.current) {
      inputRef.current.focus()
    }
    setShowHint(false)
  }, [currentQuestionIndex, isFillBlank])

  const handleOptionSelect = (option: string) => {
    // Store the selected option for this question
    setSelectedOption((prev) => ({
      ...prev,
      [currentQuestionIndex]: option,
    }))

    // Move to next question automatically after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      }
    }, 300)
  }

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: e.target.value,
    }))
  }

  const handleTextSubmit = () => {
    const answer = textAnswers[currentQuestionIndex]
    if (!answer || !answer.trim()) return

    // Move to next question after submitting
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFillBlank) {
      handleTextSubmit()
    }
  }

  // Helper function to check if the selected option is correct for multiple choice
  const checkMultipleChoiceAnswer = (questionIndex: number, selectedOption: string): boolean => {
    const question = questions[questionIndex]
    const correctAnswer = question.correct_answer

    // If the correct_answer is a direct match
    if (correctAnswer === selectedOption) {
      return true
    }

    // If the options are in {id, text} format and correct_answer is an id
    const optionsArray = question.options as any[]
    if (
      Array.isArray(optionsArray) &&
      optionsArray.length > 0 &&
      typeof optionsArray[0] === "object" &&
      "id" in optionsArray[0]
    ) {
      // Find the option with matching text
      const selectedOptionObj = optionsArray.find((opt: any) => opt.text === selectedOption)
      if (selectedOptionObj && selectedOptionObj.id === correctAnswer) {
        return true
      }
    }

    return false
  }

  // Helper function to check if the text answer is correct for fill-blank
  const checkFillBlankAnswer = (questionIndex: number, answer: string): boolean => {
    if (!answer || !answer.trim()) return false

    const question = questions[questionIndex]
    const userAnswer = answer.trim()
    const correctAnswer = question.correct_answer || ""

    // Get validation settings
    const validation = question.validation || { type: "exact" }

    // Check based on validation type
    switch (validation.type) {
      case "case-insensitive":
        if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
          return true
        }
        // Check alternate answers if provided
        if (validation.alternateAnswers && Array.isArray(validation.alternateAnswers)) {
          return validation.alternateAnswers.some(
            (alt: string) => alt && userAnswer.toLowerCase() === alt.toLowerCase(),
          )
        }
        return false

      case "contains":
        if (correctAnswer.toLowerCase().includes(userAnswer.toLowerCase())) {
          return true
        }
        // Check alternate answers if provided
        if (validation.alternateAnswers && Array.isArray(validation.alternateAnswers)) {
          return validation.alternateAnswers.some(
            (alt: string) => alt && alt.toLowerCase().includes(userAnswer.toLowerCase()),
          )
        }
        return false

      case "fuzzy":
        // Simple fuzzy matching - check if the answer is at least 80% similar
        const threshold = validation.threshold || 0.8
        const similarity = calculateSimilarity(userAnswer.toLowerCase(), correctAnswer.toLowerCase())
        if (similarity >= threshold) {
          return true
        }
        // Check alternate answers if provided
        if (validation.alternateAnswers && Array.isArray(validation.alternateAnswers)) {
          return validation.alternateAnswers.some(
            (alt: string) => alt && calculateSimilarity(userAnswer.toLowerCase(), alt.toLowerCase()) >= threshold,
          )
        }
        return false

      case "exact":
      default:
        if (userAnswer === correctAnswer) {
          return true
        }
        // Check alternate answers if provided
        if (validation.alternateAnswers && Array.isArray(validation.alternateAnswers)) {
          return validation.alternateAnswers.some((alt: string) => alt && alt === userAnswer)
        }
        return false
    }
  }

  // Simple Levenshtein distance for fuzzy matching
  const calculateSimilarity = (a: string, b: string): number => {
    if (!a || !b) return 0
    if (a.length === 0) return 0
    if (b.length === 0) return 0

    const matrix = []

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          )
        }
      }
    }

    // Calculate similarity as 1 - (distance / max length)
    const distance = matrix[b.length][a.length]
    return 1 - distance / Math.max(a.length, b.length)
  }

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const toggleHint = () => {
    setShowHint(!showHint)
  }

  const handleFinish = async () => {
    // Calculate results and score
    const newResults: boolean[] = []
    let score = 0

    questions.forEach((question, index) => {
      const isMultipleChoice = question.question_type === "multiple-choice" || question.type === "multiple-choice"

      let selectedOptionForQuestion: string | undefined = undefined
      if (selectedOption) {
        selectedOptionForQuestion = selectedOption[index]
      }

      if (isMultipleChoice) {
        const selectedOption = selectedOptionForQuestion
        if (selectedOption) {
          const isCorrect = checkMultipleChoiceAnswer(index, selectedOption)
          newResults.push(isCorrect)
          if (isCorrect) score++
        } else {
          newResults.push(false) // No answer selected
        }
      } else {
        // Fill in the blank
        const textAnswer = textAnswers[index]
        if (textAnswer) {
          const isCorrect = checkFillBlankAnswer(index, textAnswer)
          newResults.push(isCorrect)
          if (isCorrect) score++
        } else {
          newResults.push(false) // No answer provided
        }
      }
    })

    setResults(newResults)
    setIsFinished(true)
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    try {
      // Save score to database
      await supabase.from("user_scores").insert({
        quiz_id: quiz.id,
        score: score,
        max_score: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        time_taken: timeTaken,
        // No user_id for anonymous users
      })
    } catch (error) {
      console.error("Error saving score:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (isFinished) {
    // Prepare answers array for QuizResults
    const allAnswers = questions.map((_, index) => {
      const isMultipleChoiceQ =
        questions[index].question_type === "multiple-choice" || questions[index].type === "multiple-choice"
      return isMultipleChoiceQ ? selectedOption[index] || "No answer" : textAnswers[index] || "No answer"
    })

    return (
      <QuizResults
        score={results.filter(Boolean).length}
        totalQuestions={questions.length}
        timeTaken={quiz.time_limit - timeLeft}
        quizId={quiz.id}
        quizTitle={quiz.title}
        questions={questions}
        answers={allAnswers}
        results={results}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className="text-sm font-medium">Time left: {formatTime(timeLeft)}</div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="p-6 relative">
        <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>

        {/* Multiple Choice Question */}
        {isMultipleChoice && (
          <div className="grid gap-3">
            {options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption[currentQuestionIndex] === option ? "secondary" : "outline"}
                className="justify-start text-left h-auto py-3 px-4"
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        )}

        {/* Fill in the Blank Question */}
        {isFillBlank && (
          <div className="space-y-4">
            <div>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your answer here..."
                value={textAnswers[currentQuestionIndex] || ""}
                onChange={handleTextInputChange}
                onKeyPress={handleKeyPress}
                className="bg-slate-700 border-slate-600"
              />
            </div>

            {currentQuestion.hint && (
              <div>
                <Button variant="outline" size="sm" onClick={toggleHint} className="flex items-center gap-1 text-xs">
                  <HelpCircle className="h-3 w-3" />
                  {showHint ? "Hide Hint" : "Show Hint"}
                </Button>
                {showHint && (
                  <div className="mt-2 text-sm bg-slate-700 p-2 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p>{currentQuestion.hint}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-2">
          {isFillBlank && (
            <Button onClick={handleTextSubmit} disabled={!textAnswers[currentQuestionIndex]?.trim()}>
              Submit
            </Button>
          )}

          {currentQuestionIndex < questions.length - 1 ? (
            <Button variant="outline" onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish}>Finish Quiz</Button>
          )}
        </div>
      </div>
    </div>
  )
}

function useRouter() {
  return {
    push: (path: string) => {
      window.location.href = path
    },
  }
}
