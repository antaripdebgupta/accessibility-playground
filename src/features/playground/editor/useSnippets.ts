"use client";

import * as React from "react";
import {
  listSnippets,
  saveSnippet,
  deleteSnippet,
  type SavedSnippet,
} from "@/lib/snippet-library";
import { useToast } from "@accessly-ui/react";

export function useSnippets(html: string, css: string) {
  const [snippets, setSnippets] = React.useState<SavedSnippet[]>(() =>
    listSnippets()
  );
  const [isNamingSnippet, setIsNamingSnippet] = React.useState(false);
  const [newSnippetName, setNewSnippetName] = React.useState("");
  const toast = useToast();

  const handleSaveSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnippetName.trim()) return;
    const created = saveSnippet(newSnippetName, html, css);
    setSnippets(listSnippets());
    setNewSnippetName("");
    setIsNamingSnippet(false);
    toast.push({
      title: "Snippet saved",
      description: `Saved "${created.name}" to your library.`,
      variant: "success",
    });
  };

  const handleDeleteSnippet = (
    e: React.MouseEvent,
    id: string,
    name: string
  ) => {
    e.stopPropagation();
    deleteSnippet(id);
    setSnippets(listSnippets());
    toast.push({
      title: "Snippet deleted",
      description: `Removed "${name}".`,
      variant: "info",
    });
  };

  return {
    snippets,
    isNamingSnippet,
    setIsNamingSnippet,
    newSnippetName,
    setNewSnippetName,
    handleSaveSnippet,
    handleDeleteSnippet,
  };
}
