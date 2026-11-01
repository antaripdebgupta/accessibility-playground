"use client";

import * as React from "react";
import {
  listSnippets,
  saveSnippet,
  deleteSnippet,
  renameSnippet,
  duplicateSnippet,
  exportSnippets,
  importSnippets,
  MAX_IMPORT_SIZE,
  type SavedSnippet,
} from "@/lib/snippet-library";
import { useToast } from "@accessly-ui/react";
import { downloadBlob } from "@/lib/report";

export function useSnippets(html: string, css: string) {
  const [snippets, setSnippets] = React.useState<SavedSnippet[]>(() =>
    listSnippets()
  );
  const [isNamingSnippet, setIsNamingSnippet] = React.useState(false);
  const [newSnippetName, setNewSnippetName] = React.useState("");
  const [editingSnippetId, setEditingSnippetId] = React.useState<string | null>(null);
  const [editingSnippetName, setEditingSnippetName] = React.useState("");
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

  const handleStartRename = (e: React.MouseEvent, snip: SavedSnippet) => {
    e.stopPropagation();
    setEditingSnippetId(snip.id);
    setEditingSnippetName(snip.name);
  };

  const handleSaveRename = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const finalName = editingSnippetName.trim() || "Untitled Snippet";
    renameSnippet(id, finalName);
    setSnippets(listSnippets());
    setEditingSnippetId(null);
    setEditingSnippetName("");
    toast.push({
      title: "Snippet renamed",
      description: `Renamed to "${finalName}".`,
      variant: "success",
    });
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSnippetId(null);
    setEditingSnippetName("");
  };

  const handleDuplicateSnippet = (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();
    const copy = duplicateSnippet(id);
    setSnippets(listSnippets());
    if (copy) {
      toast.push({
        title: "Snippet duplicated",
        description: `Created copy "${copy.name}".`,
        variant: "success",
      });
    }
  };

  const handleExportAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonString = exportSnippets();
    downloadBlob(jsonString, `a11y-snippets-${Date.now()}.json`, "application/json");
    toast.push({
      title: "Snippets exported",
      description: `Exported ${snippets.length} snippet(s) to JSON.`,
      variant: "success",
    });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMPORT_SIZE) {
      toast.push({
        title: "Import rejected",
        description: `File size exceeds the 2MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        variant: "danger",
      });
      e.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      const count = importSnippets(text);
      setSnippets(listSnippets());
      toast.push({
        title: "Snippets imported",
        description: `Successfully imported ${count} snippet(s).`,
        variant: "success",
      });
    } catch (err) {
      toast.push({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Malformed or invalid snippet file.",
        variant: "danger",
      });
    } finally {
      e.target.value = "";
    }
  };

  return {
    snippets,
    isNamingSnippet,
    setIsNamingSnippet,
    newSnippetName,
    setNewSnippetName,
    editingSnippetId,
    editingSnippetName,
    setEditingSnippetName,
    handleSaveSnippet,
    handleDeleteSnippet,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDuplicateSnippet,
    handleExportAll,
    handleImportFile,
  };
}
