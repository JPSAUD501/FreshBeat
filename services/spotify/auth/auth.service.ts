import { AuthorizationServer, Client, clientCredentialsGrantRequest, ClientSecretBasic, discoveryRequest, processClientCredentialsResponse, processDiscoveryResponse } from 'oauth4webapi'
import { SPOTIFY_AUTH_URL } from '@soundify/web-api/auth'
import { SpotifyClient } from '@soundify/web-api'

export class Auth {
  private readonly clientID: string
  private readonly clientSecret: string
  readonly spotifyClient: SpotifyClient

  constructor(clientId: string, clientSecret: string) {
    this.clientID = clientId
    this.clientSecret = clientSecret

    const oauthClient: Client = {
      client_id: this.clientID,
      client_secret: this.clientSecret,
      token_endpoint_auth_method: 'client_secret_basic',
    }

    const refresher = async () => {
      const issuer = new URL(SPOTIFY_AUTH_URL)
      const discoveryResponse = await discoveryRequest(issuer)
      const authServer = await processDiscoveryResponse(issuer, discoveryResponse) as AuthorizationServer

      const parameters = new URLSearchParams()

      const clientAuth = ClientSecretBasic(this.clientSecret)

      const res = await clientCredentialsGrantRequest(
        authServer,
        oauthClient,
        clientAuth,
        parameters,
      )

      const result = await processClientCredentialsResponse(
        authServer,
        oauthClient,
        res,
      )

      if (result.error !== undefined) {
        throw new Error(
          result.error + (result.error_description ? ' : ' + result.error_description : ''),
        )
      }
      return result.access_token
    }

    this.spotifyClient = new SpotifyClient(null, { refresher })
  }
}
