export interface Option {
  id: string;
  optionText: string;
  isCorrect: boolean;
}
 
export interface MCQ {
  id: string;
  questionTitle: string;
  difficulty: string;
  options: Option[];
}
 
export interface ApiQuestion {
  id: string;
  status: 'not_visited' | 'skipped' | 'answered';
  selectedOptionId: string | null;
  editable: boolean;
  mcq_question: MCQ;
}