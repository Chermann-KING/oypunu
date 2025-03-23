export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  isOnline?: boolean;
  lastActive?: Date;
  nativeLanguage?: string;
  learningLanguages?: string[];
  contacts?: string[];
  roles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
