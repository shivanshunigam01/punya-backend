import axios from "axios";

export function surepassClient() {
  const baseURL = process.env.SUREPASS_BASE_URL;
  const token = process.env.SUREPASS_TOKEN;
  if (!baseURL || !token) throw new Error("Surepass env missing");
  return axios.create({
    baseURL,
    timeout: 20000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}
