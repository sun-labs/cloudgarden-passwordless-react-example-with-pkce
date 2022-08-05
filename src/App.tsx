import * as React from "react"
import {
  Routes,
  Route,
  Link,
  useNavigate,
  Outlet,
} from "react-router-dom"
import { CLIENT_ID, REDIRECT_URI } from "./constants"
import { usePasswordless } from "./usePasswordless"
import { useQuery } from "./useQuery"

export default function App() {
  return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PasswordlessLoginRequestCodePage />} />
          <Route path="/claim" element={<PasswordlessLoginClaimCodePage />} />
        </Route>
      </Routes>
  )
}

function Layout() {
  return (
    <div>
      <ul>
        <li>
          <Link to="/">Public Page</Link>
        </li>
        <li>
          <Link to="/claim">Claim code</Link>
        </li>
      </ul>

      <Outlet />
    </div>
  )
}

function PasswordlessLoginRequestCodePage() {
  let navigate = useNavigate();
  const { requestLoginCode, loading } = usePasswordless(REDIRECT_URI, CLIENT_ID)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget)
    let email = formData.get("email") as string

    await requestLoginCode(email)

    navigate('/claim')
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Email: <input name="email" type="email" />
        </label>
        <button type="submit">Send code</button>
      </form>
    </div>
  );
}

function PasswordlessLoginClaimCodePage() {
  const { code } = useQuery()
  const [tokens, setTokens] = React.useState()
  const { claimLoginCode, loading } = usePasswordless(REDIRECT_URI, CLIENT_ID)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let code = formData.get("code") as string;

    const res = await claimLoginCode(code)

    setTokens(res)
  }

  const tokenEffectFn = async () => {
    if (!code) return

    const res = await claimLoginCode(code)

    setTokens(res)
  }

  // @ts-expect-error 2345
  React.useEffect(tokenEffectFn, [code])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      {code && !tokens && (
        <p>Your code is: {code}</p>
      )}
      {!code  && !tokens && (
        <form>
          <label>
            Code: <input name="code" type="text" />
          </label>
          <button type="submit">Claim code</button>
        </form>
      )}
      {tokens && (
        <pre>{JSON.stringify(tokens, null, 2)}</pre>
      )}
    </div>
  )
}
