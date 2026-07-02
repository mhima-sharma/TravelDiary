"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuestionSchema, AnswerSchema } from "@/schemas";

async function revalidatePlace(placeId: string) {
  const place = await db.place.findUnique({ where: { id: placeId }, select: { slug: true } });
  if (place) revalidatePath(`/places/${place.slug}`);
}

export async function createQuestion(placeId: string, values: z.infer<typeof QuestionSchema>) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const parsed = QuestionSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  await db.question.create({
    data: { ...parsed.data, userId: session.user.id, placeId },
  });

  await revalidatePlace(placeId);
  return { success: "Question posted!" };
}

export async function deleteQuestion(questionId: string) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question) return { error: "Question not found" };
  if (question.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  await db.question.delete({ where: { id: questionId } });
  await revalidatePlace(question.placeId);
  return { success: "Question deleted" };
}

export async function createAnswer(questionId: string, values: z.infer<typeof AnswerSchema>) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const parsed = AnswerSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input" };

  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question) return { error: "Question not found" };

  await db.answer.create({
    data: { ...parsed.data, userId: session.user.id, questionId },
  });

  await revalidatePlace(question.placeId);
  return { success: "Answer posted!" };
}

export async function deleteAnswer(answerId: string) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const answer = await db.answer.findUnique({ where: { id: answerId }, include: { question: true } });
  if (!answer) return { error: "Answer not found" };
  if (answer.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  await db.answer.delete({ where: { id: answerId } });
  await revalidatePlace(answer.question.placeId);
  return { success: "Answer deleted" };
}
