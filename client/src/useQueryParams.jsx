import { useSearchParams } from "react-router-dom";

export default function useQueryParams() {
  const [seachParams] = useSearchParams()
  return Object.fromEntries([...seachParams])
}