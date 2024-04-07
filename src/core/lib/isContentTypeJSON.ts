export const isContentTypeJSON = (response: {
  headers: Response["headers"];
}): boolean => {
  const contentType = response.headers.get("Content-Type");
  return contentType !== null && contentType.includes("application/json");
};
