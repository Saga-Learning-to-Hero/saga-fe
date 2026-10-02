export const ASSISTANT_QUESTION_MAX = 1000;

export type QuestionValidation =
  | { ok: true; question: string }
  | { ok: false; message: string };

export function validateAssistantQuestion(raw: string): QuestionValidation {
  const question = raw.trim();
  if (question.length < 1) {
    return { ok: false, message: "Hãy nhập câu hỏi." };
  }
  if (question.length > ASSISTANT_QUESTION_MAX) {
    return { ok: false, message: `Câu hỏi tối đa ${ASSISTANT_QUESTION_MAX} ký tự.` };
  }
  return { ok: true, question };
}
