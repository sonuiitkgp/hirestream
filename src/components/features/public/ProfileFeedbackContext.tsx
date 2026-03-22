"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type FeedbackItem = {
  id: string;
  kind: "suggestion" | "comment";
  sectionType: string;
  fieldName?: string;
  sectionItemId?: string;
  // suggestion fields
  originalText?: string;
  suggestedText?: string;
  // comment fields
  content?: string;
  // common
  status: string;
  createdAt: string | Date;
};

type ProfileFeedbackContextType = {
  items: FeedbackItem[];
  addItem: (item: FeedbackItem) => void;
  highlightedId: string | null;
  setHighlightedId: (id: string | null) => void;
};

const ProfileFeedbackContext = createContext<ProfileFeedbackContextType>({
  items: [],
  addItem: () => {},
  highlightedId: null,
  setHighlightedId: () => {},
});

export function ProfileFeedbackProvider({
  initialItems,
  children,
}: {
  initialItems: FeedbackItem[];
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<FeedbackItem[]>(initialItems);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const addItem = useCallback((item: FeedbackItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  return (
    <ProfileFeedbackContext.Provider
      value={{ items, addItem, highlightedId, setHighlightedId }}
    >
      {children}
    </ProfileFeedbackContext.Provider>
  );
}

export function useProfileFeedback() {
  return useContext(ProfileFeedbackContext);
}
