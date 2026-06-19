import { renderHook, act } from "@testing-library/react";
import { useModal } from "../hooks/useModal";

describe("useModal", () => {
  test("état initial : fermé, aucun item sélectionné", () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  test("openModal() sans argument ouvre la modale avec item null", () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedItem).toBeNull();
  });

  test("openModal(item) ouvre la modale et stocke l'item", () => {
    const { result } = renderHook(() => useModal());
    const item = { id: 42, nom: "Test client" };

    act(() => {
      result.current.openModal(item);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedItem).toEqual(item);
  });

  test("closeModal() ferme la modale et vide l'item", () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openModal({ id: 1 });
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });

  test("sequence open → close → open fonctionne correctement", () => {
    const { result } = renderHook(() => useModal());

    act(() => result.current.openModal({ id: 1 }));
    act(() => result.current.closeModal());
    act(() => result.current.openModal({ id: 2 }));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedItem).toEqual({ id: 2 });
  });
});
