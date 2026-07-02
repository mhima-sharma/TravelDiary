"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MessageCircle, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionSchema, AnswerSchema, type QuestionInput, type AnswerInput } from "@/schemas";
import { createQuestion, deleteQuestion, createAnswer, deleteAnswer } from "@/actions/questions";
import { formatDate } from "@/lib/utils";

interface QAUser { id: string; name: string | null; image: string | null }
interface QAAnswer { id: string; body: string; createdAt: Date; userId: string; user: QAUser }
interface QAQuestion { id: string; body: string; createdAt: Date; userId: string; user: QAUser; answers: QAAnswer[] }

interface QASectionProps {
  placeId: string;
  questions: QAQuestion[];
  session: { user: { id: string; role: string } } | null;
}

function AskQuestionForm({ placeId, onDone }: { placeId: string; onDone?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestionInput>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: { body: "" },
  });

  const onSubmit = (data: QuestionInput) => {
    startTransition(async () => {
      const result = await createQuestion(placeId, data);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        reset();
        onDone?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Textarea
        placeholder="Ask a question about this place... e.g. Is parking available?"
        rows={3}
        {...register("body")}
      />
      {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Post Question
      </Button>
    </form>
  );
}

function AnswerForm({ questionId, onDone }: { questionId: string; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<AnswerInput>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: { body: "" },
  });

  const onSubmit = (data: AnswerInput) => {
    startTransition(async () => {
      const result = await createAnswer(questionId, data);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        onDone();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 mt-3">
      <Textarea placeholder="Write your answer..." rows={2} {...register("body")} />
      {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Answer
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

const QUESTIONS_LIMIT = 3;
const ANSWERS_LIMIT = 1;

function UserAvatar({ user }: { user: QAUser }) {
  return (
    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
      {user.image ? (
        <Image src={user.image} alt={user.name || ""} width={32} height={32} className="object-cover" />
      ) : (
        <User className="h-4 w-4" />
      )}
    </div>
  );
}

export function QASection({ placeId, questions, session }: QASectionProps) {
  const [answering, setAnswering] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const toggleAnswers = (questionId: string) => {
    setExpandedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const canModify = (ownerId: string) =>
    !!session && (session.user.id === ownerId || session.user.role === "ADMIN");

  const handleDeleteQuestion = (id: string) => {
    startTransition(async () => {
      const result = await deleteQuestion(id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  const handleDeleteAnswer = (id: string) => {
    startTransition(async () => {
      const result = await deleteAnswer(id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Community Q&A ({questions.length})
      </h2>

      {session ? (
        <div className="p-5 border rounded-xl bg-card">
          <h3 className="font-medium mb-3">Ask a Question</h3>
          <AskQuestionForm placeId={placeId} />
        </div>
      ) : (
        <div className="p-5 border rounded-xl text-center bg-muted/30">
          <p className="text-muted-foreground mb-3">Sign in to ask a question</p>
          <Button asChild size="sm"><Link href="/login">Sign In</Link></Button>
        </div>
      )}

      <div className="space-y-4">
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">No questions yet. Be the first to ask!</p>
        )}
        {(showAllQuestions ? questions : questions.slice(0, QUESTIONS_LIMIT)).map((question) => {
          const answersExpanded = expandedAnswers.has(question.id);
          const visibleAnswers = answersExpanded ? question.answers : question.answers.slice(0, ANSWERS_LIMIT);
          const hiddenAnswerCount = question.answers.length - visibleAnswers.length;

          return (
            <div key={question.id} className="p-4 border rounded-xl">
              <div className="flex gap-3">
                <UserAvatar user={question.user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-medium">{question.user.name || "Anonymous"}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{formatDate(question.createdAt)}</p>
                      {canModify(question.userId) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-1 text-destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1">{question.body}</p>

                  {visibleAnswers.length > 0 && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2">
                      {visibleAnswers.map((answer) => (
                        <div key={answer.id} className="flex gap-3">
                          <UserAvatar user={answer.user} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-sm font-medium">{answer.user.name || "Anonymous"}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">{formatDate(answer.createdAt)}</p>
                                {canModify(answer.userId) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-1 text-destructive"
                                    onClick={() => handleDeleteAnswer(answer.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{answer.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.answers.length > ANSWERS_LIMIT && (
                    <Button
                      size="sm"
                      variant="link"
                      className="mt-1 h-auto px-0 py-0 text-xs"
                      onClick={() => toggleAnswers(question.id)}
                    >
                      {answersExpanded ? "Show less" : `View more answers (${hiddenAnswerCount})`}
                    </Button>
                  )}

                  {session && (
                    answering === question.id ? (
                      <AnswerForm questionId={question.id} onDone={() => setAnswering(null)} />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 px-2 text-xs"
                        onClick={() => setAnswering(question.id)}
                      >
                        Answer
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!showAllQuestions && questions.length > QUESTIONS_LIMIT && (
          <Button variant="outline" size="sm" onClick={() => setShowAllQuestions(true)}>
            View more questions ({questions.length - QUESTIONS_LIMIT})
          </Button>
        )}
      </div>
    </div>
  );
}
