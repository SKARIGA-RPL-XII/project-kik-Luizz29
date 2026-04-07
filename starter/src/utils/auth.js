export function getRoleId() {
  const token = localStorage.getItem("authToken"); 
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role_id ?? null;
  } catch (err) {
    console.error("getRoleId error:", err);
    return null;
  }
}
