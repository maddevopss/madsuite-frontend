import { renderHook, act } from "@testing-library/react";
import { useConfirm } from "../hooks/useConfirm";

describe("useConfirm", () => {
  test("état initial : modale fermée, message vide", () => {
    const { result } = renderHook(() => useConfirm());

    expect(result.current.confirmProps.isOpen).toBe(false);
    expect(result.current.confirmProps.message).toBe("");
  });

  test("confirm() ouvre la modale avec le bon message", async () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.confirm("Supprimer cet élément ?");
    });

    expect(result.current.confirmProps.isOpen).toBe(true);
    expect(result.current.confirmProps.message).toBe("Supprimer cet élément ?");
  });

  test("onConfirm() résout la Promise à true et ferme la modale", async () => {
    const { result } = renderHook(() => useConfirm());
    let promise;

    act(() => {
      promise = result.current.confirm("Confirmer ?");
    });

    act(() => {
      result.current.confirmProps.onConfirm();
    });

    await expect(promise).resolves.toBe(true);
    expect(result.current.confirmProps.isOpen).toBe(false);
    expect(result.current.confirmProps.message).toBe("");
  });

  test("onCancel() résout la Promise à false et ferme la modale", async () => {
    const { result } = renderHook(() => useConfirm());
    let promise;

    act(() => {
      promise = result.current.confirm("Annuler ?");
    });

    act(() => {
      result.current.confirmProps.onCancel();
    });

    await expect(promise).resolves.toBe(false);
    expect(result.current.confirmProps.isOpen).toBe(false);
  });

  test("deux confirmations successives fonctionnent indépendamment", async () => {
    const { result } = renderHook(() => useConfirm());

    // Première confirmation → annulée
    let p1;
    act(() => {
      p1 = result.current.confirm("Question 1");
    });
    act(() => {
      result.current.confirmProps.onCancel();
    });
    await expect(p1).resolves.toBe(false);

    // Deuxième confirmation → acceptée
    let p2;
    act(() => {
      p2 = result.current.confirm("Question 2");
    });
    act(() => {
      result.current.confirmProps.onConfirm();
    });
    await expect(p2).resolves.toBe(true);
  });

  test("onConfirm et onCancel sont exposés dans confirmProps", () => {
    const { result } = renderHook(() => useConfirm());

    expect(typeof result.current.confirmProps.onConfirm).toBe("function");
    expect(typeof result.current.confirmProps.onCancel).toBe("function");
  });
});
