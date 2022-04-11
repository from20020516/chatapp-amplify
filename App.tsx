import React, { createContext, useEffect, useState } from 'react'
import { Button, StyleSheet, Platform, Text, View } from 'react-native'
import { Amplify, Auth, AuthModeStrategyType, DataStore, Hub } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import awsconfig from './src/aws-exports'
import Home from './src/Home'

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    redirectSignIn: `${window.location.origin}/`,
    redirectSignOut: `${window.location.origin}/`,
  },
  DataStore: {
    authModeStrategyType: AuthModeStrategyType.MULTI_AUTH
  }
})

interface IUser {
  id: string
  username: string
  attributes: {
    email: string
    email_verified: boolean
    identities: string
    sub: string
  }
}
export const UserContext = createContext<IUser | null>(null)

const App = () => {
  const [user, setUser] = useState<IUser | null>(null)

  useEffect(() => {
    Hub.listen('auth', async ({ payload: { event, data } }) => {
      console.log(event, data)
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          break
        case 'signOut':
        case 'oAuthSignOut':
          await DataStore.clear()
          setUser(null)
          break
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data)
          break
      }
    });
    (async () => setUser(await Auth.currentUserInfo()))()
  }, [])

  return (
    <UserContext.Provider value={user}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {user ? (
            <Button title="Sign Out" onPress={() => Auth.signOut()} />
          ) : (
            <Button title="Federated Sign In" onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })} />
          )}
        </View>
        {user && <Home />}
      </View>
    </UserContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#4696ec',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 16,
    textAlign: 'center',
  },
})

export default App
