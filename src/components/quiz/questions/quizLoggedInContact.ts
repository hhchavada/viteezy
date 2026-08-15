import type { QuizQuestion } from "@/store/api/types/healthQuiz.types";
import type { User } from "@/store/api/types/user.types";
import { getLoggedInUserEmail, getUserFromStorage } from "@/lib/utils";
import {
  isGeneralEmailQuestion,
  isGeneralNameQuestion,
} from "./generalQuestionValidation";

export type LoggedInQuizContact = {
  name: string;
  email: string;
};

export function getLoggedInQuizContactFromStorage(): LoggedInQuizContact {
  const user = getUserFromStorage();
  if (!user) return { name: "", email: "" };

  const firstName =
    typeof user.firstName === "string" ? user.firstName.trim() : "";
  const lastName =
    typeof user.lastName === "string" ? user.lastName.trim() : "";
  const name =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    (typeof user.name === "string" ? user.name.trim() : "");

  const email =
    getLoggedInUserEmail() ||
    (typeof user.email === "string" ? user.email.trim() : "");

  return { name, email };
}

export function getLoggedInQuizContactFromProfile(
  user?: User | null
): LoggedInQuizContact {
  if (!user) return { name: "", email: "" };

  const firstName = user.firstName?.trim() || "";
  const lastName = user.lastName?.trim() || "";
  const name =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    user.name?.trim() ||
    "";

  return {
    name,
    email: user.email?.trim() || "",
  };
}

export function resolveLoggedInQuizContact(
  profileUser?: User | null
): LoggedInQuizContact {
  const fromProfile = getLoggedInQuizContactFromProfile(profileUser);
  const fromStorage = getLoggedInQuizContactFromStorage();

  return {
    name: fromProfile.name || fromStorage.name,
    email: fromProfile.email || fromStorage.email,
  };
}

export function resolveGeneralQuestionTextState(
  question: QuizQuestion,
  storedTextValue: string,
  contact: LoggedInQuizContact,
  isLoggedIn: boolean
): { textValue: string; locked: boolean } {
  if (!isLoggedIn) {
    return { textValue: storedTextValue, locked: false };
  }

  if (isGeneralNameQuestion(question) && contact.name) {
    return { textValue: contact.name, locked: true };
  }

  if (isGeneralEmailQuestion(question) && contact.email) {
    return { textValue: contact.email, locked: true };
  }

  return { textValue: storedTextValue, locked: false };
}

export function isGeneralQuestionFieldLocked(
  question: QuizQuestion | null,
  isLoggedIn: boolean,
  contact: LoggedInQuizContact
): boolean {
  if (!question || !isLoggedIn) return false;

  if (isGeneralNameQuestion(question)) {
    return Boolean(contact.name);
  }

  if (isGeneralEmailQuestion(question)) {
    return Boolean(contact.email);
  }

  return false;
}
