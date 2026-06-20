import { useState,  useState, useCallback } from "react";

export function useConfirm() {
  const [state, setState] = useState({
    isOpen: false,
    message: "",
    resolve: null,
  });

  // Ouvre la modale et retourne une Promise qui résout true/false
  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ isOpen: true, message, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false, message: "", resolve: null });
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false, message: "", resolve: null });
  }, [state]);

  return {
    confirmProps: {
      isOpen: state.isOpen,
      message: state.message,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    confirm,
  };
}
