export function getApiErrorMessage(error, fallback = "Une erreur est survenue.") {
  const data = error?.response?.data;
  const message = data?.errors?.message || data?.message || fallback;
  const fieldErrors = data?.errors?.fieldErrors || {};
  const formErrors = data?.errors?.formErrors || [];

  const details = [
    ...formErrors,
    ...Object.entries(fieldErrors).flatMap(([field, errors]) =>
      (errors || []).map((fieldMessage) => `${field}: ${fieldMessage}`),
    ),
  ].filter(Boolean);

  if (!details.length) {
    return message || fallback;
  }

  return `${message || fallback} ${details.join(" ")}`;
}
