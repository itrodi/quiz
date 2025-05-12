"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QuizResults } from "@/components/quiz-results"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import type { Tables } from "@/lib/supabase/database.types"

type QuizProps = {
  quiz: Tables<"quizzes"> & {
    categories: Tables<"categories"> | null
    profiles: Pick<Tables<"profiles">, "username" | "display_name" | "avatar_url"> | null
  }
  questions: Tables<"questions">[]
}

export function MultipleChoiceQuiz({ quiz, questions }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit)
  const [isFinished, setIsFinished] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [startTime] = useState<number>(Date.now())

  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const currentQuestion = questions[currentQuestionIndex]
  const options = (currentQuestion?.options as string[]) || []
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

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

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return
    setSelectedOption(option)
    setIsAnswered(true)

    const isCorrect = option === currentQuestion.correct_answer
    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }))

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedOption(null)
        setIsAnswered(false)
      } else {
        handleFinish()
      }
    }, 1000)
  }

  const handleFinish = async () => {
    setIsFinished(true)
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    // Save score to database if user is logged in
    if (user) {
      try {
        await supabase.from("user_scores").insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score: score,
          max_score: questions.length,
          percentage: Math.round((score / questions.length) * 100),
          time_taken: timeTaken,
        })

        // Update user stats
        await supabase
          .from("profiles")
          .update({
            total_score: supabase.rpc("increment", { x: score }),
            quizzes_taken: supabase.rpc("increment", { x: 1 }),
          })
          .eq("id", user.id)

        // Check for achievements
        await checkAchievements(user.id, score, questions.length)
      } catch (error) {
        console.error("Error saving score:", error)
      }
    }
  }

  const checkAchievements = async (userId: string, score: number, maxScore: number) => {
    try {
      // Check for perfect score achievement
      if (score === maxScore) {
        const { data: perfectScoreAchievement } = await supabase
          .from("achievements")
          .select("id")
          .eq("name", "Perfect Score")
          .single()

        if (perfectScoreAchievement) {
          await supabase.from("user_achievements").upsert(
            {
              user_id: userId,
              achievement_id: perfectScoreAchievement.id,
              progress: 100,
              max_progress: 100,
              unlocked: true,
              unlocked_at: new Date().toISOString(),
            },
            { onConflict: "user_id,achievement_id" },
          )
        }
      }

      // Check for quiz novice achievement
      const { data: quizzesTaken } = await supabase
        .from("user_scores")
        .select("id", { count: true })
        .eq("user_id", userId)

      if (quizzesTaken && quizzesTaken.length >= 5) {
        const { data: quizNoviceAchievement } = await supabase
          .from("achievements")
          .select("id")
          .eq("name", "Quiz Novice")
          .single()

        if (quizNoviceAchievement) {
          await supabase.from("user_achievements").upsert(
            {
              user_id: userId,
              achievement_id: quizNoviceAchievement.id,
              progress: quizzesTaken.length,
              max_progress: 5,
              unlocked: quizzesTaken.length >= 5,
              unlocked_at: quizzesTaken.length >= 5 ? new Date().toISOString() : null,
            },
            { onConflict: "user_id,achievement_id" },
          )
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error)
    }
  }

  if (isFinished) {
    return (
      <QuizResults
        score={score}
        totalQuestions={questions.length}
        timeTaken={quiz.time_limit - timeLeft}
        quizId={quiz.id}
        quizTitle={quiz.title}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className="text-sm font-medium">Time left: {timeLeft}s</div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>

        <div className="grid gap-3">
          {options.map((option, index) => (
            <Button
              key={index}
              variant={
                isAnswered
                  ? option === currentQuestion.correct_answer
                    ? "success"
                    : option === selectedOption
                      ? "destructive"
                      : "outline"
                  : "outline"
              }
              className="justify-start text-left h-auto py-3 px-4"
              onClick={() => handleOptionSelect(option)}
              disabled={isAnswered}
            >
              {option}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
