import { useState } from "react"
import { BASE_ENDPOINT } from "./constants"

export const usePasswordless = (redirectUriDefault?: string, clientIdDefault?: string) => {
  const [loading, setLoading] = useState<boolean>(false)

  const setCodeVerifier = (codeVerifier: string) => {
    localStorage.setItem('codeVerifier', codeVerifier)
  }

  const getCodeVerifier = (): string | null => {
    return localStorage.getItem('codeVerifier')
  }

  const generateCodeVerifier = (): string => {
    const codeUint8Array = new Uint8Array(32)
    const randomCodeValuesArray = Array.from(window.crypto.getRandomValues(codeUint8Array))

    return String.fromCharCode.apply(null, randomCodeValuesArray)
  }

  const base64URLEncodeString = (str: string): string => {
    const base64String = window.btoa(str)

    return base64String
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  }

  const generateCodechallenge = async (str: string): Promise<string> => {
    const hashArray = await window.crypto.subtle.digest(
      { name: "SHA-256" },
      new TextEncoder().encode(str)
    )
    const numberArray = Array.from(new Uint8Array(hashArray));
    const hashString = String.fromCharCode.apply(null, numberArray);

    return base64URLEncodeString(hashString);
  };

  const requestLoginCode = async (email: string, clientId?: string, redirectUri?: string): Promise<void> => {
    setLoading(true)

    const codeVerifier = generateCodeVerifier()
    const codeChallengeMethod = 'sha256'
    const codeChallenge = await generateCodechallenge(codeVerifier)

    await fetch(`${BASE_ENDPOINT}/auth/passwordlessLogin/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        email,
        client_id: clientId || clientIdDefault,
        redirect_uri: redirectUri || redirectUriDefault,
        code_challenge_method: codeChallengeMethod,
        code_challenge: codeChallenge
      })
    })

    setCodeVerifier(codeVerifier)

    setLoading(false)
  }

  const claimLoginCode = async (code: string, clientId?: string, redirectUri?: string): Promise<any> => {
    setLoading(true)

    const codeVerifier = getCodeVerifier()

    const response = await fetch(`${BASE_ENDPOINT}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        client_id: clientId || clientIdDefault,
        redirect_uri: redirectUri || redirectUriDefault,
        
      })
    })
    const tokens = await response.json()

    setLoading(false)

    return tokens
  }

  return {
    loading,
    getCodeVerifier,
    requestLoginCode,
    claimLoginCode
  }
}
