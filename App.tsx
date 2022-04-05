import React, { useEffect, useState } from 'react'
import { Button, Text, View } from 'react-native'
import { Amplify, Auth, Hub } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import awsconfig from './src/aws-exports'

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    redirectSignIn: `${window.location.origin}/`,
    redirectSignOut: `${window.location.origin}/`,
  }
})

const App = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    Hub.listen('auth', async ({ payload: { event, data } }) => {
      console.log(event, data)
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          setUser(await getUser())
          break
        case 'signOut':
          setUser(null)
          break
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data)
          break
      }
    });
    (async () => setUser(await getUser()))()
  }, [])

  const getUser = async () => {
    try {
      return await Auth.currentAuthenticatedUser()
    } catch (error) {
      return console.error(error)
    }
  }

  return (
    <View>
      <Text>User: {user ? JSON.stringify(user.attributes) : 'None'}</Text>
      {user ? (
        <Button title="Sign Out" onPress={() => Auth.signOut()} />
      ) : (
        <Button title="Federated Sign In" onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })} />
      )}
    </View>
  )
}

export default App
