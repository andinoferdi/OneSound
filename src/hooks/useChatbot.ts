"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  type Message,
  type ChatbotState,
  type SendMessageParams,
  type MessageContent,
} from "@/types/chatbot";
import {
  handleModelFallback,
  saveChatHistory,
  clearChatHistory,
  generateMessageId,
  MODEL_DISPLAY_NAMES,
} from "@/services/chatbot";

export const useChatbot = () => {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    currentModelIndex: 0,
    error: null,
    isStreaming: false,
    editingMessageId: null,
    isEditing: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    clearChatHistory();
  }, []);

  useEffect(() => {
    if (state.messages.length > 0) {
      saveChatHistory(state.messages);
    }
  }, [state.messages]);

  const sendMessage = useCallback(
    async ({ content, images = [], onStream, onComplete, onError }: SendMessageParams) => {
      if ((!content.trim() && images.length === 0) || state.isLoading) return;

      const messageContent: MessageContent[] = [];
      
      if (content.trim()) {
        messageContent.push({
          type: "text",
          text: content.trim()
        });
      }
      
      images.forEach(imageUrl => {
        messageContent.push({
          type: "image_url",
          image_url: { url: imageUrl }
        });
      });

      const userMessage: Message = {
        id: generateMessageId(),
        role: "user",
        content: messageContent,
        timestamp: new Date(),
        images: images,
      };

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        isLoading: true,
        isStreaming: true,
        error: null,
        currentModelIndex: 0,
      }));

      abortControllerRef.current = new AbortController();

      try {
        const messages = [...state.messages, userMessage];

        const result = await handleModelFallback(
          messages,
          state.currentModelIndex,
          (chunk: string) => {
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              ),
            }));

            onStream?.(chunk);
          },
          abortControllerRef.current.signal
        );

        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: result.content,
                  model: result.model,
                  isStreaming: false,
                }
              : msg
          ),
          isLoading: false,
          isStreaming: false,
          currentModelIndex: result.finalIndex,
          error: null,
        }));

        onComplete?.();
      } catch (error) {
        // Check if request was aborted
        if (error instanceof DOMException && error.name === 'AbortError') {
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: msg.content + "\n\n[The chat was canceled]",
                    isStreaming: false,
                  }
                : msg
            ),
            isLoading: false,
            isStreaming: false,
            error: null,
          }));
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";

        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter(
            (msg) => msg.id !== assistantMessage.id
          ),
          isLoading: false,
          isStreaming: false,
          error: errorMessage,
        }));

        onError?.(errorMessage);
      }
    },
    [state.messages, state.isLoading, state.currentModelIndex]
  );

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
      currentModelIndex: 0,
      editingMessageId: null,
      isEditing: false,
    }));
    clearChatHistory();
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (state.messages.length === 0) return;

    const lastUserMessage = [...state.messages]
      .reverse()
      .find((msg) => msg.role === "user");
    if (!lastUserMessage) return;

    const messagesBeforeLast = state.messages.slice(0, -1);
    setState((prev) => ({
      ...prev,
      messages: messagesBeforeLast,
      error: null,
      currentModelIndex: 0,
    }));

    await sendMessage({
      content: typeof lastUserMessage.content === 'string' 
        ? lastUserMessage.content 
        : lastUserMessage.content.find(c => c.type === 'text')?.text || '',
      images: lastUserMessage.images || [],
      onComplete: () => {
        setState((prev) => ({ ...prev, error: null }));
      },
      onError: (error) => {
        setState((prev) => ({ ...prev, error }));
      },
    });
  }, [state.messages, sendMessage]);

  const startEditingLastMessage = useCallback(() => {
    const lastUserMessage = [...state.messages]
      .reverse()
      .find((msg) => msg.role === "user");
    
    if (!lastUserMessage) return null;

    setState((prev) => ({
      ...prev,
      editingMessageId: lastUserMessage.id,
      isEditing: true,
    }));

    return {
      content: typeof lastUserMessage.content === 'string' 
        ? lastUserMessage.content 
        : lastUserMessage.content.find(c => c.type === 'text')?.text || '',
      images: lastUserMessage.images || [],
    };
  }, [state.messages]);

  const cancelEditing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      editingMessageId: null,
      isEditing: false,
    }));
  }, []);

  const resendEditedMessage = useCallback(async (
    content: string,
    onComplete?: () => void,
    onError?: (error: string) => void
  ) => {
    const assistantMessage: Message = {
      id: generateMessageId(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, assistantMessage],
      isLoading: true,
      isStreaming: true,
      error: null,
      currentModelIndex: 0,
    }));

    abortControllerRef.current = new AbortController();

    try {
      const messages = state.messages;

      const result = await handleModelFallback(
        messages,
        state.currentModelIndex,
        (chunk: string) => {
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            ),
          }));
        },
        abortControllerRef.current.signal
      );

      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: result.content,
                model: result.model,
                isStreaming: false,
              }
            : msg
        ),
        isLoading: false,
        isStreaming: false,
        currentModelIndex: result.finalIndex,
        error: null,
      }));

      onComplete?.();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: msg.content + "\n\n[The chat was canceled]",
                  isStreaming: false,
                }
              : msg
          ),
          isLoading: false,
          isStreaming: false,
          error: null,
        }));
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter(
          (msg) => msg.id !== assistantMessage.id
        ),
        isLoading: false,
        isStreaming: false,
        error: errorMessage,
      }));

      onError?.(errorMessage);
    }
  }, [state.messages, state.currentModelIndex]);

  const updateAndResendMessage = useCallback(async (
    messageId: string,
    newContent: string, 
    images: string[] = [],
    onComplete?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!messageId) return;

    const lastUserMessageIndex = state.messages.findIndex(
      (msg) => msg.id === messageId
    );

    if (lastUserMessageIndex === -1) return;

    const messagesBeforeEdit = state.messages.slice(0, lastUserMessageIndex + 1);
    const updatedMessages = messagesBeforeEdit.map((msg) =>
      msg.id === messageId
        ? {
            ...msg,
            content: newContent,
            images: images,
          }
        : msg
    );

    setState((prev) => ({
      ...prev,
      messages: updatedMessages,
      editingMessageId: null,
      isEditing: false,
      error: null,
    }));

    await resendEditedMessage(newContent, () => {
      setState((prev) => ({ ...prev, error: null }));
      onComplete?.();
    }, (error) => {
      setState((prev) => ({ ...prev, error }));
      onError?.(error);
    });
  }, [state.messages, resendEditedMessage]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      isStreaming: false,
    }));
  }, []);

  const getCurrentModelName = useCallback(() => {
    return MODEL_DISPLAY_NAMES[state.currentModelIndex] || "Unknown Model";
  }, [state.currentModelIndex]);

  const getLastAssistantMessage = useCallback(() => {
    return [...state.messages]
      .reverse()
      .find((msg) => msg.role === "assistant");
  }, [state.messages]);

  return {
    ...state,
    sendMessage,
    clearMessages,
    retryLastMessage,
    cancelRequest,
    getCurrentModelName,
    getLastAssistantMessage,
    startEditingLastMessage,
    cancelEditing,
    updateAndResendMessage,
    resendEditedMessage,
  };
};
