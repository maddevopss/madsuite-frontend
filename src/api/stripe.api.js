import api from "./api";

export const createCheckoutSession = async (successUrl, cancelUrl) => {
  const response = await api.post("/stripe/create-checkout-session", {
    successUrl,
    cancelUrl,
  });
  return response.data;
};
