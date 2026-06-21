import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { portalService } from "../api/portal.service";

export function usePortal(token) {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [localStatus, setLocalStatus] = useState(null);

  const paymentResult = searchParams.get("payment"); // "success" | "cancelled"

  const fetchData = useCallback(async () => {
    try {
      const result = await portalService.fetchPortalDocument(token);
      setData(result);
      setLocalStatus(result.document?.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch if payment=success to get updated status
  useEffect(() => {
    if (paymentResult === "success" && data) {
      // Optimistic update
      setLocalStatus("paid");
      // Also re-fetch after short delay to confirm from server
      const timeoutId = setTimeout(fetchData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [paymentResult, fetchData, data]);

  const handleAction = async (action, sigData = null) => {
    const finalSignature = sigData || signatureData;
    setActionLoading(true);
    try {
      await portalService.submitPortalAction(token, action, finalSignature);
      setLocalStatus(action);
      setShowSignature(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    setPaymentLoading(true);
    try {
      const result = await portalService.initiateCheckout(token);
      window.location.href = result.url;
    } catch (err) {
      alert(err.message || "Impossible d'initier le paiement.");
      setPaymentLoading(false);
    }
  };

  const handleSignatureConfirm = (dataUrl) => {
    setSignatureData(dataUrl);
    // Auto-submit after signature confirmed
    handleAction("accepted", dataUrl);
  };

  return {
    data,
    loading,
    error,
    actionLoading,
    paymentLoading,
    showSignature,
    setShowSignature,
    signatureData,
    setSignatureData,
    localStatus,
    paymentResult,
    handleAction,
    handlePay,
    handleSignatureConfirm,
    pdfUrl: portalService.getPdfUrl(token)
  };
}
