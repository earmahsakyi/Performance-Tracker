import { motion } from "framer-motion"
import { Trophy, Clock, CheckCircle, XCircle, Play, RotateCcw } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"

const Quizzes = () => {
  const quizStats = [
    { label: "Completed", value: 24, color: "text-success", bgColor: "bg-success/10" },
    { label: "In Progress", value: 3, color: "text-warning", bgColor: "bg-warning/10" },
    { label: "Available", value: 8, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Average Score", value: "87%", color: "text-success", bgColor: "bg-success/10" },
  ]

  const availableQuizzes = [
    {
      title: "React State Management",
      subject: "React Fundamentals",
      questions: 15,
      duration: 20,
      difficulty: "Medium",
      attempts: 0,
      maxScore: 100,
    },
    {
      title: "CSS Advanced Selectors",
      subject: "UI/UX Design",
      questions: 12,
      duration: 15,
      difficulty: "Easy",
      attempts: 0,
      maxScore: 100,
    },
    {
      title: "JavaScript Promises",
      subject: "JavaScript ES6+",
      questions: 18,
      duration: 25,
      difficulty: "Hard",
      attempts: 1,
      maxScore: 85,
    },
  ]

  const recentResults = [
    {
      title: "React Hooks Fundamentals",
      subject: "React Fundamentals",
      score: 95,
      maxScore: 100,
      completedAt: "2 hours ago",
      passed: true,
    },
    {
      title: "Flexbox Layout",
      subject: "UI/UX Design", 
      score: 78,
      maxScore: 100,
      completedAt: "1 day ago",
      passed: true,
    },
    {
      title: "Array Methods Deep Dive",
      subject: "JavaScript ES6+",
      score: 92,
      maxScore: 100,
      completedAt: "3 days ago",
      passed: true,
    },
  ]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "success"
      case "Medium": return "warning"
      case "Hard": return "destructive"
      default: return "secondary"
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Quizzes & Assessments
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge and track your learning progress
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quizStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-card shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Available Quizzes */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Available Quizzes
            </CardTitle>
            <CardDescription>
              Ready to test your knowledge?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-3 bg-gradient-primary rounded-lg text-primary-foreground">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">{quiz.subject}</p>
                      </div>
                      <div className="text-right">
                        {quiz.attempts > 0 && (
                          <Badge variant="outline" className="mb-1">
                            Best: {quiz.maxScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{quiz.questions} questions</span>
                      <span>•</span>
                      <span>{quiz.duration} minutes</span>
                      <span>•</span>
                      <Badge variant={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                      {quiz.attempts > 0 && (
                        <>
                          <span>•</span>
                          <span>{quiz.attempts} attempt(s)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {quiz.attempts > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success("Retaking quiz!")}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retake
                      </Button>
                    )}
                    <Button
                      className="bg-gradient-primary hover:opacity-90"
                      size="sm"
                      onClick={() => toast.success(`Starting ${quiz.title}!`)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Recent Results
            </CardTitle>
            <CardDescription>
              Your latest quiz performances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result, index) => (
                <motion.div
                  key={result.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                >
                  <div className={`p-2 rounded-lg ${result.passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {result.passed ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">{result.subject}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {result.score}/{result.maxScore}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((result.score / result.maxScore) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Progress 
                        value={(result.score / result.maxScore) * 100} 
                        className="flex-1 mr-4"
                      />
                      <span className="text-sm text-muted-foreground">
                        {result.completedAt}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Quizzes