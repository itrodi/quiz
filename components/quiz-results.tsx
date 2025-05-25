"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle } from "lucide-react"

interface QuizResultsProps {
  correctAnswers: number
  totalQuestions: number
  onRestart: () => void
}

export function QuizResults({ correctAnswers, totalQuestions, onRestart }: QuizResultsProps) {
  const percentage = (correctAnswers / totalQuestions) * 100
  const passed = percentage >= 70

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Quiz Results</CardTitle>
        <CardDescription>
          You answered {correctAnswers} out of {totalQuestions} questions correctly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {passed ? (
            <>
              <CheckCircle2 className="text-green-500 h-8 w-8" />
              <p className="text-lg font-semibold">Congratulations! You passed!</p>
            </>
          ) : (
            <>
              <XCircle className="text-red-500 h-8 w-8" />
              <p className="text-lg font-semibold">You failed. Please try again.</p>
            </>
          )}
        </div>
        <Separator className="my-4" />
        <p>You scored {percentage.toFixed(2)}%.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onRestart}>Restart Quiz</Button>
      </CardFooter>
    </Card>
  )
}
