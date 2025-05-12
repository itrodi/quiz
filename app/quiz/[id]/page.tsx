import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { MultipleChoiceQuiz } from "@/components/quiz-types/multiple-choice-quiz"
import { ImageQuiz } from "@/components/quiz-types/image-quiz"
import { ListQuiz } from "@/components/quiz-types/list-quiz"
import { MapQuiz } from "@/components/quiz-types/map-quiz"

export default async function QuizPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch quiz data
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(`
      *,
      categories(*),
      profiles(username, display_name, avatar_url)
    `)
    .eq("id", params.id)
    .single()

  if (quizError || !quiz) {
    console.error("Error fetching quiz:", quizError)
    notFound()
  }

  // Fetch questions
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", params.id)
    .order("order_index", { ascending: true })

  if (questionsError || !questions || questions.length === 0) {
    console.error("Error fetching questions:", questionsError)
    notFound()
  }

  // Increment play count
  await supabase
    .from("quizzes")
    .update({ plays: quiz.plays + 1 })
    .eq("id", params.id)

  // Determine quiz type based on first question
  const quizType = questions[0].question_type

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          {quiz.emoji && <span>{quiz.emoji}</span>}
          {quiz.title}
        </h1>
        {quiz.description && <p className="text-gray-400 mb-2">{quiz.description}</p>}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-gray-800 px-2 py-1 rounded-full">{quiz.categories?.name || "Uncategorized"}</span>
          <span>•</span>
          <span>{quiz.time_limit} seconds</span>
          <span>•</span>
          <span>{questions.length} questions</span>
          <span>•</span>
          <span>{quiz.plays} plays</span>
        </div>
      </div>

      {quizType === "multiple-choice" && <MultipleChoiceQuiz quiz={quiz} questions={questions} />}

      {quizType === "image" && <ImageQuiz quiz={quiz} questions={questions} />}

      {quizType === "list" && <ListQuiz quiz={quiz} questions={questions} />}

      {quizType === "map" && <MapQuiz quiz={quiz} questions={questions} />}
    </div>
  )
}
