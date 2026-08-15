export type QuizAnswerType = "answer" | "text" | "date_picker";
export type QuizAnswerSelection = "single" | "multiple";

export interface I18nString {
  en?: string;
  nl?: string;
  [key: string]: string | undefined;
}

export type LocalizedText = string | I18nString;

export interface QuizCategoryRef {
  _id: string;
  code: string;
  title: LocalizedText;
}

export interface QuizAnswerOption {
  _id: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  image?: string;
  value: string;
  severityScore?: number;
  sortOrder: number;
  conditionalFlowCategoryId?: string | null;
  products?: unknown[];
}

export interface QuizDatePickerConfig {
  allowDay: boolean;
  allowMonth: boolean;
  allowYear: boolean;
}

export interface QuizQuestion {
  _id: string;
  questionCode: string;
  categoryId: QuizCategoryRef;
  goalId?: {
    _id: string;
    title: string;
  };
  title: LocalizedText;
  subtitle?: LocalizedText;
  backgroundImage?: string | null;
  mobileBackgroundImage?: string | null;
  goalIcon?: string | null;
  answerType: QuizAnswerType;
  answerSelection?: QuizAnswerSelection;
  maxSelection?: number;
  placeholder?: LocalizedText;
  isRequired?: boolean;
  datePickerConfig?: QuizDatePickerConfig;
  options: QuizAnswerOption[];
  priority: number;
  status: string;
  isActive?: boolean;
}

export interface QuizSessionProgress {
  answered: number;
  total: number;
  percentage: number;
}

export interface QuizInfoPageReview {
  _id?: string;
  reviewerName?: LocalizedText;
  reviewDescription?: LocalizedText;
  rating: number;
  sortOrder?: number;
  photo?: string | null;
}

export interface QuizInfoPageBenefit {
  _id?: string;
  text?: LocalizedText;
  sortOrder?: number;
}

export interface QuizInfoPage {
  _id: string;
  slug?: string;
  displayTitle?: LocalizedText;
  subtitle?: LocalizedText;
  supportingImage?: string | null;
  backgroundImage?: string | null;
  mobileBackgroundImage?: string | null;
  benefits?: Array<QuizInfoPageBenefit | string>;
  reviews?: QuizInfoPageReview[];
  priority?: number;
  sortOrder?: number;
  questionRef?: string;
  duration?: number;
  isActive?: boolean;
}

export interface QuizSessionData {
  sessionId?: string;
  guestToken?: string;
  status?: string;
  firstQuestion?: QuizQuestion;
  currentQuestion?: QuizQuestion;
  nextQuestion?: QuizQuestion | null;
  lastQuestion?: QuizQuestion;
  questions?: QuizQuestion[];
  currentCategory?: string;
  nextCategory?: string;
  isGoalSelectionRequired?: boolean;
  isLastQuestion?: boolean;
  isConditionalFlow?: boolean;
  isComplete?: boolean;
  infoPage?: QuizInfoPage | null;
  infoPages?: QuizInfoPage[];
  progress: QuizSessionProgress;
}

export interface CreateQuizSessionRequest {
  user_id?: string;
}

export interface QuizApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type CreateQuizSessionResponse = QuizApiResponse<QuizSessionData>;

export interface ActiveQuizSessionData {
  hasSavedSession: boolean;
  savedSession?: QuizSessionData | null;
  pendingRecommendationId?: string | null;
  pendingSessionId?: string | null;
}

export type GetActiveQuizSessionResponse = QuizApiResponse<ActiveQuizSessionData>;

export interface SubmitQuizAnswerBody {
  questionId?: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
  dateAnswer?: string;
  selectedGoals?: string[];
}

export interface SubmitQuizAnswerRequest extends SubmitQuizAnswerBody {
  sessionId: string;
}

export type SubmitQuizAnswerResponse = QuizApiResponse<QuizSessionData>;

export interface QuizSessionStoredAnswer {
  type: "answer";
  values: string[];
  selectionOrder: string[];
}

export interface QuizSessionStoredTextAnswer {
  type: "text" | "date";
  value: string;
}

export interface QuizSessionApiTextAnswer {
  type: "text" | "date_picker";
  values?: string[];
  selectionOrder?: string[];
  value?: string;
}

export interface QuizSessionStoredGoalAnswer {
  type: "goals";
  goalIds: string[];
}

export interface QuizSessionSelectedGoal {
  goalId: string;
  priorityOrder?: number;
}

export type QuizSessionSavedAnswer =
  | QuizSessionStoredAnswer
  | QuizSessionStoredTextAnswer
  | QuizSessionStoredGoalAnswer
  | QuizSessionApiTextAnswer;

export interface QuizSessionAnswersData {
  sessionId: string;
  status?: string;
  answers: Record<string, QuizSessionSavedAnswer>;
  currentQuestionId: string | null;
  questionSnapshots: Record<string, QuizQuestion>;
  visitedQuestionIds: string[];
  selectedGoals?: Array<string | QuizSessionSelectedGoal>;
  progress: QuizSessionProgress;
  isGoalSelectionRequired?: boolean;
  nextCategory?: string;
  currentCategory?: string;
}

export type GetQuizSessionAnswersResponse = QuizApiResponse<QuizSessionAnswersData>;

export interface QuizGoal {
  _id: string;
  title: string;
  icon?: string;
}

export interface GetGoalsResponse {
  success: boolean;
  message: string;
  data: {
    goals: QuizGoal[];
  };
}

export interface QuizBundleProductPrice {
  currency?: string;
  amount?: number;
  discountedPrice?: number;
  taxRate?: number;
}

export interface QuizBundleProduct {
  _id: string;
  slug?: string;
  title?: string;
  productImage?: string;
  status?: boolean;
  price?: QuizBundleProductPrice;
  shortDescription?: string;
  description?: string;
}

export interface QuizBundleItemPricing {
  original?: number;
  monthly?: number;
  unitPrice?: number;
  currency?: string;
  lineSubtotal?: number;
  planKey?: string;
  dailyPillCount?: number;
  thirtyDayQuantity?: number;
}

export interface QuizBundleItem {
  product: QuizBundleProduct;
  totalPoints?: number;
  dosage?: number;
  phase?: "am" | "pm" | string;
  isGoalRequired?: boolean;
  pillCount?: number;
  isDisabled?: boolean;
  isUserRemoved?: boolean;
  isRemoved?: boolean;
  removed?: boolean;
  isPadded?: boolean;
  isAdded?: boolean;
  action?: "add" | "remove";
  amDosage?: number;
  pmDosage?: number;
  pricing?: QuizBundleItemPricing;
  shortDescription?: string;
  description?: string;
  recommendationReason?: string;
}

export interface QuizMembershipDiscount {
  label?: string;
  percentage?: number;
  amount?: number;
}

export interface QuizPlanPricing {
  currency?: string;
  productSubtotal?: number;
  subtotal?: number;
  membershipDiscount?: QuizMembershipDiscount | null;
  discountedSubtotal?: number;
  membershipFee?: number | null;
  shipping?: number;
  tax?: number;
  total?: number;
}

export interface QuizMembershipPrice {
  amount?: number;
  currency?: string;
}

export interface QuizActiveMembership {
  membershipId?: string;
  planId?: string;
  name?: string;
  slug?: string;
  interval?: string;
  label?: string;
  price?: QuizMembershipPrice;
  savingsBadge?: string | null;
  expiresAt?: string;
  benefits?: string[];
}

export interface QuizMembershipPlan {
  planId: string;
  name?: string;
  slug?: string;
  interval?: string;
  label?: string;
  price?: QuizMembershipPrice;
  durationDays?: number;
  discountPercentage?: number | null;
  savingsBadge?: string | null;
  isBestValue?: boolean;
  isSelected?: boolean;
  action?: "add" | "remove";
  benefits?: string[];
  shortDescription?: string;
}

export interface QuizCompleteMembership {
  title?: string;
  subtitle?: string;
  hasActiveMembership?: boolean;
  activeMembership?: QuizActiveMembership | null;
  plans?: QuizMembershipPlan[];
}

export interface QuizRotationQueueProduct {
  _id?: string;
  slug?: string;
  title?: string;
  productImage?: string;
  status?: boolean;
  price?: QuizBundleProductPrice;
}

export interface QuizRotationQueueItem {
  product?: QuizRotationQueueProduct;
  shortDescription?: string;
  description?: string;
}

export interface QuizCompleteUser {
  firstName?: string;
}

export interface QuizCompleteData {
  sessionId?: string;
  recommendationId?: string;
  _id?: string;
  severityLevel?: string;
  severityIndex?: number;
  status?: string;
  user?: QuizCompleteUser;
  essentialBundle?: QuizBundleItem[];
  advancedBundle?: QuizBundleItem[];
  addonProducts?: QuizBundleItem[];
  rotationQueue?: QuizRotationQueueItem[];
  pricing?: {
    essential?: QuizPlanPricing;
    advanced?: QuizPlanPricing;
  };
  membership?: QuizCompleteMembership;
  createdAt?: string;
}

export type CompleteQuizSessionResponse = QuizApiResponse<QuizCompleteData>;

export type QuizRecommendationBundleType = "essential" | "advanced";

export interface QuizRecommendationCheckoutData {
  cartId: string;
  bundleType: QuizRecommendationBundleType;
  recommendationId: string;
  isExisting: boolean;
  nextStep?: string;
}

export type QuizRecommendationCheckoutResponse =
  QuizApiResponse<QuizRecommendationCheckoutData>;

export interface QuizRecommendationCheckoutRequest {
  recommendationId: string;
  bundleType: QuizRecommendationBundleType;
}

export type QuizRecommendationPillQuantityAction = "increment" | "decrement";

export interface QuizRecommendationPillQuantityRequest {
  recommendationId: string;
  productId: string;
  action: QuizRecommendationPillQuantityAction;
  sessionId: string;
}

export type QuizRecommendationPillQuantityResponse =
  QuizApiResponse<Record<string, unknown>>;

export interface QuizRecommendationAddonRequest {
  recommendationId: string;
  productId: string;
  sessionId: string;
  remove?: boolean;
}

export type QuizRecommendationAddonResponse =
  QuizApiResponse<Record<string, unknown>>;

export interface QuizRecommendationProductVisibilityRequest {
  recommendationId: string;
  productId: string;
  removed: boolean;
  sessionId: string;
}

export type QuizRecommendationProductVisibilityResponse =
  QuizApiResponse<Record<string, unknown>>;

export interface SaveQuizSessionBody {
  name: string;
  email: string;
  marketingConsent?: boolean;
  whatsappConsent?: boolean;
}

export interface SaveQuizSessionRequest extends SaveQuizSessionBody {
  sessionId: string;
}

export type SaveQuizSessionResponse = QuizApiResponse<Record<string, unknown>>;

export type DiscardQuizSessionResponse = QuizApiResponse<Record<string, unknown>>;

export interface QuizSessionContactInfo {
  name?: string;
  email?: string;
  isFirstTimeCustomer?: boolean;
}

export type GetQuizSessionContactInfoResponse =
  QuizApiResponse<QuizSessionContactInfo>;

export interface QuizConfigurationImage {
  _id: string;
  image: string;
  sortOrder: number;
}

export interface QuizConfiguration {
  _id: string;
  configKey: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaButton: LocalizedText;
  backgroundImage?: string;
  mobileBackgroundImage?: string | null;
  quizImages?: QuizConfigurationImage[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizConfigurationData {
  configuration: QuizConfiguration;
}

export type GetQuizConfigurationResponse =
  QuizApiResponse<QuizConfigurationData>;
